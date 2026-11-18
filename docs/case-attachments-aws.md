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

## Antivirus

No está incluido. Opciones que requieren infraestructura adicional y costo: *GuardDuty Malware Protection
for S3* (por GB analizado) o ClamAV en un contenedor. Mientras tanto se mitiga aceptando solo PDF/Word,
validando firma real, guardando con `Content-Disposition: attachment` y sin servir los archivos desde un
dominio propio.

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
