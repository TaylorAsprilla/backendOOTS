# 📚 Ejemplos de Uso de Catálogos

## Obtener Países

### Caso 1: Listar Todos los Países

```bash
curl -X GET http://localhost:3000/countries
```

**Respuesta:**

```json
[
  {
    "id": 1,
    "code": "CO",
    "name": "Colombia",
    "iso3": "COL",
    "phoneCode": "+57"
  },
  {
    "id": 2,
    "code": "VE",
    "name": "Venezuela",
    "iso3": "VEN",
    "phoneCode": "+58"
  },
  {
    "id": 3,
    "code": "EC",
    "name": "Ecuador",
    "iso3": "ECU",
    "phoneCode": "+593"
  }
]
```

---

## Navegación Geográfica

### Caso 1: Departamentos de Colombia

```bash
curl -X GET http://localhost:3000/departments
```

**Respuesta:**

```json
[
  {
    "id": 1,
    "name": "Antioquia",
    "code": "05",
    "countryId": 1
  },
  {
    "id": 2,
    "name": "Bogotá D.C.",
    "code": "11",
    "countryId": 1
  },
  {
    "id": 3,
    "name": "Valle del Cauca",
    "code": "76",
    "countryId": 1
  }
]
```

### Caso 2: Ciudades de Antioquia

```bash
curl -X GET http://localhost:3000/cities/1
```

**Respuesta:**

```json
[
  {
    "id": 1,
    "name": "Medellín",
    "code": "05001",
    "departmentId": 1
  },
  {
    "id": 15,
    "name": "Bello",
    "code": "05088",
    "departmentId": 1
  },
  {
    "id": 28,
    "name": "Itagüí",
    "code": "05360",
    "departmentId": 1
  }
]
```

---

## Tipos de Documentos

### Caso 1: Obtener Tipos de Documentos

```bash
curl -X GET http://localhost:3000/document-types
```

**Respuesta:**

```json
[
  {
    "id": 1,
    "code": "CC",
    "name": "Cédula de Ciudadanía",
    "description": "Documento de identidad para ciudadanos colombianos mayores de edad"
  },
  {
    "id": 2,
    "code": "TI",
    "name": "Tarjeta de Identidad",
    "description": "Documento para menores de edad entre 7 y 17 años"
  },
  {
    "id": 3,
    "code": "RC",
    "name": "Registro Civil",
    "description": "Documento para menores de 7 años"
  }
]
```

---

## Tipos de Violencias

### Caso 1: Catálogo de Violencias

```bash
curl -X GET http://localhost:3000/violence-types
```

**Respuesta:**

```json
[
  {
    "id": 1,
    "name": "Violencia Física",
    "description": "Uso intencional de la fuerza física que puede causar daño",
    "category": "INTERPERSONAL"
  },
  {
    "id": 2,
    "name": "Violencia Psicológica",
    "description": "Agresión emocional, verbal o de comportamiento",
    "category": "INTERPERSONAL"
  },
  {
    "id": 3,
    "name": "Violencia Sexual",
    "description": "Actos sexuales no consentidos o coaccionados",
    "category": "INTERPERSONAL"
  }
]
```

---

## Información Demográfica

### Caso 1: Géneros

```bash
curl -X GET http://localhost:3000/genders
```

**Respuesta:**

```json
[
  {
    "id": 1,
    "name": "Masculino",
    "code": "M"
  },
  {
    "id": 2,
    "name": "Femenino",
    "code": "F"
  },
  {
    "id": 3,
    "name": "Intersexual",
    "code": "I"
  }
]
```

### Caso 2: Etnias

```bash
curl -X GET http://localhost:3000/ethnicities
```

**Respuesta:**

```json
[
  {
    "id": 1,
    "name": "Mestizo",
    "description": "Población de origen mixto europeo e indígena"
  },
  {
    "id": 2,
    "name": "Afrocolombiano",
    "description": "Población de ascendencia africana"
  },
  {
    "id": 3,
    "name": "Indígena",
    "description": "Pueblos originarios de América"
  }
]
```

---

## JavaScript Service para Catálogos

### Servicio Completo de Catálogos

```javascript
class CatalogService {
  constructor(baseUrl = 'http://localhost:3000') {
    this.baseUrl = baseUrl;
    this.cache = new Map();
    this.cacheTimeout = 5 * 60 * 1000; // 5 minutos
  }

  async fetchWithCache(endpoint) {
    const cacheKey = endpoint;
    const cachedData = this.cache.get(cacheKey);

    if (cachedData && Date.now() - cachedData.timestamp < this.cacheTimeout) {
      return cachedData.data;
    }

    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      // Guardar en cache
      this.cache.set(cacheKey, {
        data,
        timestamp: Date.now(),
      });

      return data;
    } catch (error) {
      console.error(`Error fetching ${endpoint}:`, error);
      throw error;
    }
  }

  // Métodos geográficos
  async getCountries() {
    return await this.fetchWithCache('/countries');
  }

  async getDepartments() {
    return await this.fetchWithCache('/departments');
  }

  async getCities() {
    return await this.fetchWithCache('/cities');
  }

  async getCitiesByDepartment(departmentId) {
    return await this.fetchWithCache(`/cities/${departmentId}`);
  }

  // Métodos de identificación
  async getDocumentTypes() {
    return await this.fetchWithCache('/document-types');
  }

  // Métodos de violencias
  async getViolenceTypes() {
    return await this.fetchWithCache('/violence-types');
  }

  // Métodos demográficos
  async getGenders() {
    return await this.fetchWithCache('/genders');
  }

  async getEthnicities() {
    return await this.fetchWithCache('/ethnicities');
  }

  async getSexualOrientations() {
    return await this.fetchWithCache('/sexual-orientations');
  }

  async getGenderIdentities() {
    return await this.fetchWithCache('/gender-identities');
  }

  // Métodos sociales
  async getMaritalStatuses() {
    return await this.fetchWithCache('/marital-statuses');
  }

  async getEducationLevels() {
    return await this.fetchWithCache('/education-levels');
  }

  async getSocioeconomicStrata() {
    return await this.fetchWithCache('/socioeconomic-strata');
  }

  // Métodos de discapacidad
  async getDisabilityTypes() {
    return await this.fetchWithCache('/disability-types');
  }

  // Métodos familiares
  async getRelationshipTypes() {
    return await this.fetchWithCache('/relationship-types');
  }

  // Método para obtener todos los catálogos
  async getAllCatalogs() {
    try {
      const [
        countries,
        departments,
        cities,
        documentTypes,
        violenceTypes,
        genders,
        ethnicities,
        sexualOrientations,
        genderIdentities,
        maritalStatuses,
        educationLevels,
        socioeconomicStrata,
        disabilityTypes,
        relationshipTypes,
      ] = await Promise.all([
        this.getCountries(),
        this.getDepartments(),
        this.getCities(),
        this.getDocumentTypes(),
        this.getViolenceTypes(),
        this.getGenders(),
        this.getEthnicities(),
        this.getSexualOrientations(),
        this.getGenderIdentities(),
        this.getMaritalStatuses(),
        this.getEducationLevels(),
        this.getSocioeconomicStrata(),
        this.getDisabilityTypes(),
        this.getRelationshipTypes(),
      ]);

      return {
        geographic: { countries, departments, cities },
        identification: { documentTypes },
        violence: { violenceTypes },
        demographic: {
          genders,
          ethnicities,
          sexualOrientations,
          genderIdentities,
        },
        social: {
          maritalStatuses,
          educationLevels,
          socioeconomicStrata,
        },
        disability: { disabilityTypes },
        family: { relationshipTypes },
      };
    } catch (error) {
      console.error('Error loading catalogs:', error);
      throw error;
    }
  }

  // Limpiar cache
  clearCache() {
    this.cache.clear();
  }
}

// Uso del servicio
const catalogService = new CatalogService();

// Ejemplo 1: Cargar selectores geográficos
async function setupGeographicSelectors() {
  try {
    // Cargar países
    const countries = await catalogService.getCountries();
    const countrySelect = document.getElementById('country-select');

    countries.forEach((country) => {
      const option = document.createElement('option');
      option.value = country.id;
      option.textContent = country.name;
      countrySelect.appendChild(option);
    });

    // Cargar departamentos (Colombia por defecto)
    const departments = await catalogService.getDepartments();
    const departmentSelect = document.getElementById('department-select');

    departments.forEach((department) => {
      const option = document.createElement('option');
      option.value = department.id;
      option.textContent = department.name;
      departmentSelect.appendChild(option);
    });

    // Listener para cargar ciudades cuando cambie departamento
    departmentSelect.addEventListener('change', async (e) => {
      const departmentId = e.target.value;
      if (departmentId) {
        const cities = await catalogService.getCitiesByDepartment(departmentId);
        const citySelect = document.getElementById('city-select');

        // Limpiar opciones anteriores
        citySelect.innerHTML =
          '<option value="">Seleccione una ciudad</option>';

        cities.forEach((city) => {
          const option = document.createElement('option');
          option.value = city.id;
          option.textContent = city.name;
          citySelect.appendChild(option);
        });
      }
    });
  } catch (error) {
    console.error('Error setting up geographic selectors:', error);
  }
}
```

---

## React Hook para Catálogos

```javascript
import { useState, useEffect, createContext, useContext } from 'react';

const CatalogContext = createContext();

export const useCatalogs = () => {
  const context = useContext(CatalogContext);
  if (!context) {
    throw new Error('useCatalogs must be used within CatalogProvider');
  }
  return context;
};

export const CatalogProvider = ({ children }) => {
  const [catalogs, setCatalogs] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchCatalog = async (endpoint, key) => {
    try {
      const response = await fetch(`http://localhost:3000${endpoint}`);

      if (!response.ok) {
        throw new Error(`Failed to fetch ${key}`);
      }

      const data = await response.json();

      setCatalogs((prev) => ({
        ...prev,
        [key]: data,
      }));

      return data;
    } catch (err) {
      console.error(`Error fetching ${key}:`, err);
      throw err;
    }
  };

  const loadAllCatalogs = async () => {
    setLoading(true);
    setError(null);

    try {
      await Promise.all([
        fetchCatalog('/countries', 'countries'),
        fetchCatalog('/departments', 'departments'),
        fetchCatalog('/cities', 'cities'),
        fetchCatalog('/document-types', 'documentTypes'),
        fetchCatalog('/violence-types', 'violenceTypes'),
        fetchCatalog('/genders', 'genders'),
        fetchCatalog('/ethnicities', 'ethnicities'),
        fetchCatalog('/sexual-orientations', 'sexualOrientations'),
        fetchCatalog('/gender-identities', 'genderIdentities'),
        fetchCatalog('/marital-statuses', 'maritalStatuses'),
        fetchCatalog('/education-levels', 'educationLevels'),
        fetchCatalog('/socioeconomic-strata', 'socioeconomicStrata'),
        fetchCatalog('/disability-types', 'disabilityTypes'),
        fetchCatalog('/relationship-types', 'relationshipTypes'),
      ]);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getCitiesByDepartment = async (departmentId) => {
    if (!departmentId) return [];

    try {
      const response = await fetch(
        `http://localhost:3000/cities/${departmentId}`,
      );

      if (!response.ok) {
        throw new Error('Failed to fetch cities');
      }

      return await response.json();
    } catch (err) {
      console.error('Error fetching cities:', err);
      return [];
    }
  };

  useEffect(() => {
    loadAllCatalogs();
  }, []);

  const value = {
    catalogs,
    loading,
    error,
    getCitiesByDepartment,
    refreshCatalogs: loadAllCatalogs,
  };

  return (
    <CatalogContext.Provider value={value}>{children}</CatalogContext.Provider>
  );
};

// Componentes de ejemplo
export const GeographicSelector = ({ onLocationChange }) => {
  const { catalogs, getCitiesByDepartment } = useCatalogs();
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [cities, setCities] = useState([]);

  useEffect(() => {
    if (selectedDepartment) {
      getCitiesByDepartment(selectedDepartment)
        .then(setCities)
        .catch(console.error);
    } else {
      setCities([]);
    }
  }, [selectedDepartment, getCitiesByDepartment]);

  useEffect(() => {
    onLocationChange?.({
      departmentId: selectedDepartment,
      cityId: selectedCity,
    });
  }, [selectedDepartment, selectedCity, onLocationChange]);

  return (
    <div className="geographic-selector">
      <div>
        <label htmlFor="department">Departamento:</label>
        <select
          id="department"
          value={selectedDepartment}
          onChange={(e) => {
            setSelectedDepartment(e.target.value);
            setSelectedCity('');
          }}
        >
          <option value="">Seleccione un departamento</option>
          {catalogs.departments?.map((dept) => (
            <option key={dept.id} value={dept.id}>
              {dept.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="city">Ciudad:</label>
        <select
          id="city"
          value={selectedCity}
          onChange={(e) => setSelectedCity(e.target.value)}
          disabled={!selectedDepartment}
        >
          <option value="">Seleccione una ciudad</option>
          {cities.map((city) => (
            <option key={city.id} value={city.id}>
              {city.name}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};

export const ViolenceTypeSelector = ({
  onSelectionChange,
  multiple = false,
}) => {
  const { catalogs } = useCatalogs();
  const [selected, setSelected] = useState(multiple ? [] : '');

  const handleChange = (e) => {
    const value = e.target.value;

    if (multiple) {
      const newSelected = [...selected];
      if (newSelected.includes(value)) {
        newSelected.splice(newSelected.indexOf(value), 1);
      } else {
        newSelected.push(value);
      }
      setSelected(newSelected);
      onSelectionChange?.(newSelected);
    } else {
      setSelected(value);
      onSelectionChange?.(value);
    }
  };

  if (multiple) {
    return (
      <div className="violence-type-selector">
        <label>Tipos de Violencia:</label>
        {catalogs.violenceTypes?.map((type) => (
          <div key={type.id}>
            <input
              type="checkbox"
              id={`violence-${type.id}`}
              value={type.id}
              checked={selected.includes(type.id.toString())}
              onChange={handleChange}
            />
            <label htmlFor={`violence-${type.id}`}>{type.name}</label>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="violence-type-selector">
      <label htmlFor="violence-type">Tipo de Violencia:</label>
      <select id="violence-type" value={selected} onChange={handleChange}>
        <option value="">Seleccione un tipo</option>
        {catalogs.violenceTypes?.map((type) => (
          <option key={type.id} value={type.id}>
            {type.name}
          </option>
        ))}
      </select>
    </div>
  );
};
```

---

## Formulario Completo con Catálogos

```javascript
const PersonForm = () => {
  const { catalogs, loading } = useCatalogs();
  const [formData, setFormData] = useState({
    documentType: '',
    documentNumber: '',
    firstName: '',
    lastName: '',
    gender: '',
    ethnicity: '',
    maritalStatus: '',
    educationLevel: '',
    department: '',
    city: '',
    violenceTypes: [],
  });

  if (loading) {
    return <div>Cargando catálogos...</div>;
  }

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Form data:', formData);
    // Enviar datos al servidor
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Información de Identificación */}
      <fieldset>
        <legend>Identificación</legend>

        <div>
          <label>Tipo de Documento:</label>
          <select
            value={formData.documentType}
            onChange={(e) =>
              setFormData({
                ...formData,
                documentType: e.target.value,
              })
            }
          >
            <option value="">Seleccione</option>
            {catalogs.documentTypes?.map((type) => (
              <option key={type.id} value={type.id}>
                {type.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label>Número de Documento:</label>
          <input
            type="text"
            value={formData.documentNumber}
            onChange={(e) =>
              setFormData({
                ...formData,
                documentNumber: e.target.value,
              })
            }
          />
        </div>
      </fieldset>

      {/* Información Personal */}
      <fieldset>
        <legend>Información Personal</legend>

        <div>
          <label>Nombres:</label>
          <input
            type="text"
            value={formData.firstName}
            onChange={(e) =>
              setFormData({
                ...formData,
                firstName: e.target.value,
              })
            }
          />
        </div>

        <div>
          <label>Apellidos:</label>
          <input
            type="text"
            value={formData.lastName}
            onChange={(e) =>
              setFormData({
                ...formData,
                lastName: e.target.value,
              })
            }
          />
        </div>

        <div>
          <label>Género:</label>
          <select
            value={formData.gender}
            onChange={(e) =>
              setFormData({
                ...formData,
                gender: e.target.value,
              })
            }
          >
            <option value="">Seleccione</option>
            {catalogs.genders?.map((gender) => (
              <option key={gender.id} value={gender.id}>
                {gender.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label>Etnia:</label>
          <select
            value={formData.ethnicity}
            onChange={(e) =>
              setFormData({
                ...formData,
                ethnicity: e.target.value,
              })
            }
          >
            <option value="">Seleccione</option>
            {catalogs.ethnicities?.map((ethnicity) => (
              <option key={ethnicity.id} value={ethnicity.id}>
                {ethnicity.name}
              </option>
            ))}
          </select>
        </div>
      </fieldset>

      {/* Información Geográfica */}
      <fieldset>
        <legend>Ubicación</legend>
        <GeographicSelector
          onLocationChange={(location) =>
            setFormData({
              ...formData,
              department: location.departmentId,
              city: location.cityId,
            })
          }
        />
      </fieldset>

      {/* Tipos de Violencia */}
      <fieldset>
        <legend>Tipos de Violencia</legend>
        <ViolenceTypeSelector
          multiple
          onSelectionChange={(types) =>
            setFormData({
              ...formData,
              violenceTypes: types,
            })
          }
        />
      </fieldset>

      <button type="submit">Guardar</button>
    </form>
  );
};
```

---

## Búsqueda y Filtrado

```javascript
// Hook para búsqueda de catálogos
export const useCatalogSearch = () => {
  const { catalogs } = useCatalogs();

  const searchItems = (items, searchTerm, fields = ['name']) => {
    if (!searchTerm || !items) return items;

    const term = searchTerm.toLowerCase();

    return items.filter((item) =>
      fields.some((field) => item[field]?.toLowerCase().includes(term)),
    );
  };

  const searchCities = (searchTerm, departmentId = null) => {
    let cities = catalogs.cities || [];

    if (departmentId) {
      cities = cities.filter((city) => city.departmentId === departmentId);
    }

    return searchItems(cities, searchTerm, ['name', 'code']);
  };

  const searchDepartments = (searchTerm) => {
    return searchItems(catalogs.departments, searchTerm, ['name', 'code']);
  };

  const searchViolenceTypes = (searchTerm) => {
    return searchItems(catalogs.violenceTypes, searchTerm, [
      'name',
      'description',
    ]);
  };

  return {
    searchItems,
    searchCities,
    searchDepartments,
    searchViolenceTypes,
  };
};

// Componente de búsqueda
const CatalogSearch = ({ type, onResults }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const { searchCities, searchDepartments, searchViolenceTypes } =
    useCatalogSearch();

  useEffect(() => {
    let results = [];

    switch (type) {
      case 'cities':
        results = searchCities(searchTerm);
        break;
      case 'departments':
        results = searchDepartments(searchTerm);
        break;
      case 'violenceTypes':
        results = searchViolenceTypes(searchTerm);
        break;
      default:
        results = [];
    }

    onResults(results);
  }, [searchTerm, type]);

  return (
    <div className="catalog-search">
      <input
        type="text"
        placeholder={`Buscar ${type}...`}
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
    </div>
  );
};
```
