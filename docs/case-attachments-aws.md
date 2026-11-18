# Documentos de casos y consultas breves en S3

Los documentos (PDF y Word) se guardan en un bucket **privado** de S3; MySQL solo guarda metadatos
(`case_attachments`) y una bitácora (`case_attachment_events`: carga, descarga y eliminación).
Una consulta breve es un `Case` con `caseType = brief_consultation`, por lo que usa los mismos endpoints,
con prefijo propio en S3.

## Variables de entorno (Elastic Beanstalk)

| Variable | Obligatoria | Valor |
|---|---|---|
| `S3_DOCUMENTS_BUCKET` | Sí | nombre del bucket privado de documentos |
| `AWS_REGION` | No | `us-east-1` por defecto |
| `DOCUMENTS_MAX_FILE_MB` | No | 15 por defecto (tope duro de carga: 50 MB) |
| `DOCUMENTS_URL_TTL_SECONDS` | No | 60 por defecto (vigencia de la URL de descarga) |

Sin credenciales en el código: el SDK usa el **rol de instancia** de Elastic Beanstalk.

## Bucket (no tocar el bucket del frontend / CloudFront)

```bash
aws s3api create-bucket --bucket mioots-private-documents-prod --region us-east-1
aws s3api put-public-access-block --bucket mioots-private-documents-prod --public-access-block-configuration \
  BlockPublicAcls=true,IgnorePublicAcls=true,BlockPublicPolicy=true,RestrictPublicBuckets=true
aws s3api put-bucket-encryption --bucket mioots-private-documents-prod --server-side-encryption-configuration \
  '{"Rules":[{"ApplyServerSideEncryptionByDefault":{"SSEAlgorithm":"AES256"}}]}'
aws s3api put-bucket-ownership-controls --bucket mioots-private-documents-prod \
  --ownership-controls 'Rules=[{ObjectOwnership=BucketOwnerEnforced}]'
```

Recomendado: política que exija HTTPS (`aws:SecureTransport`) y, opcionalmente, versionado.
Clase de almacenamiento: S3 Standard. Sin CloudFront ni acceso público.

## Política IAM mínima del rol de la instancia

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": ["s3:PutObject", "s3:GetObject", "s3:DeleteObject"],
      "Resource": "arn:aws:s3:::mioots-private-documents-prod/*"
    }
  ]
}
```

`DeleteObject` solo se usa para compensar una carga cuyo registro en MySQL falló; las eliminaciones de usuario
son bajas lógicas y el archivo se conserva. Si no se desea, se puede retirar ese permiso.

## Clave de objeto

`cases/{caseId}/{consents|follow-up-referrals|referrals}/{uuid}.{pdf|doc|docx}` y
`brief-consultations/{caseId}/...`. El nombre original solo se guarda en MySQL. La carga usa
`If-None-Match: *` (no sobrescribe) y SSE-S3.

## Flujo

- **Carga:** a través del backend (multer en memoria). Así se validan extensión, MIME, firma real
  (`%PDF-`/`%%EOF`, cabecera OLE, estructura ZIP de `.docx`) y tamaño antes de escribir en S3, y se evita
  confiar en Angular. Si falla el registro en MySQL se borra el objeto subido.
- **Descarga:** el backend valida JWT, país/asignación y devuelve una URL prefirmada GET de 60 s, y registra
  la descarga. Nunca se persiste la URL ni se expone la clave.
- **Expediente cerrado:** no se permite cargar ni eliminar (ningún rol); sí consultar y descargar.

## Antivirus (ClamAV)

El backend analiza cada archivo con un demonio **ClamAV** (`clamd`) *antes* de guardarlo en S3
(`src/case-attachments/virus-scanner.service.ts`, protocolo INSTREAM por TCP). Es opcional y se activa
con variables de entorno:

| Variable | Valor por defecto | Descripción |
| --- | --- | --- |
| `CLAMAV_HOST` | *(vacío = desactivado)* | Host del demonio `clamd` |
| `CLAMAV_PORT` | `3310` | Puerto |
| `CLAMAV_TIMEOUT_MS` | `15000` | Tiempo máximo de análisis |
| `CLAMAV_FAIL_OPEN` | `false` | Si es `true` y `clamd` no responde, se acepta el archivo; por defecto la carga se rechaza (503) |

- Un archivo infectado se rechaza siempre (400) y queda registrado en el log.
- Sin `CLAMAV_HOST` el análisis queda desactivado y se registra una advertencia.
- Debe alcanzarse `clamd` desde la instancia de Elastic Beanstalk (mismo VPC, grupo de seguridad que solo
  permita el puerto 3310 desde la instancia). Una opción simple es un contenedor `clamav/clamav` en
  ECS/Fargate o en una instancia pequeña; las firmas se actualizan solas con `freshclam`.
- El tamaño máximo (15 MB) ya está por debajo del límite de `clamd` (`StreamMaxLength`, 25 MB por defecto).
- Alternativa gestionada: *GuardDuty Malware Protection for S3* (por GB analizado), que analiza *después*
  de guardar el objeto.

Se mantienen además las mitigaciones previas: solo PDF/Word, validación de la firma real del archivo,
descarga con `Content-Disposition: attachment` y URLs prefirmadas de corta duración.

## Costo estimado (S3 Standard, us-east-1; precios de referencia, verificar en la calculadora de AWS)

- Almacenamiento ≈ 0,023 USD/GB-mes: 100 GB ≈ 2,3 USD/mes; 1.000 documentos de 1 MB ≈ 1 GB ≈ 0,02 USD/mes.
- PUT ≈ 0,005 USD por 1.000 solicitudes; GET ≈ 0,0004 USD por 1.000.
- Transferencia de salida: 100 GB/mes gratis; después ≈ 0,09 USD/GB.
- SSE-S3 no tiene costo. No se agregan EC2, balanceadores ni bases de datos.
- Lo que lo aumentaría: gran volumen de archivos pesados, muchas descargas fuera de AWS, versionado con
  muchas versiones, o activar antivirus gestionado.

## Despliegue

1. Crear el bucket y la política IAM; adjuntar la política al rol de instancia de Elastic Beanstalk.
2. Definir `S3_DOCUMENTS_BUCKET` (y las demás) en la configuración del entorno.
3. Aplicar la migración (`src/migrate.ts` la ejecuta al arrancar, o correr `migrations/add-case-attachments.sql`).
4. Desplegar el backend y luego el frontend.
