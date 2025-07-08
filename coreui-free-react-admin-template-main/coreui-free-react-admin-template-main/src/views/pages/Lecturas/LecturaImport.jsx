import React, { useState } from 'react'
import {
  CButton,
  CForm,
  CFormInput,
  CAlert,
  CContainer,
  CTable,
  CTableHead,
  CTableRow,
  CTableHeaderCell,
  CTableBody,
  CTableDataCell,
  CRow,
  CCol,
} from '@coreui/react'
import Papa from 'papaparse'
import api from '../../../api/axios'
import { useNavigate } from 'react-router-dom'

const LecturaImport = () => {
  const [file, setFile] = useState(null)
  const [preview, setPreview] = useState([])
  const [headers, setHeaders] = useState([])
  const [totalRows, setTotalRows] = useState(0)
  const [success, setSuccess] = useState(null)
  const [error, setError] = useState(null)

  const navigate = useNavigate()

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0]
    setFile(selectedFile)
    setSuccess(null)
    setError(null)

    Papa.parse(selectedFile, {
      header: true,
      skipEmptyLines: true,
      complete: (result) => {
        const data = result.data
        if (data.length > 0) {
          setHeaders(Object.keys(data[0]))
          setPreview(data.slice(0, 5)) // Vista previa: primeras 5 filas
          setTotalRows(data.length) // Mostrar cuántas filas totales hay
        }
      },
      error: () => {
        setError('Error al leer el archivo CSV.')
      },
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSuccess(null)
    setError(null)

    if (!file) {
      setError('Por favor, selecciona un archivo CSV.')
      return
    }

    const formData = new FormData()
    formData.append('file', file)

    try {
      await api.post('/lecturas/upload-csv', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })
      setSuccess('Lecturas importadas exitosamente.')
      setPreview([])
      setFile(null)
      setTotalRows(0)
    } catch (err) {
      setError(err.response?.data?.mensaje || 'Error al importar lecturas.')
    }
  }

  const handleCancel = () => navigate(-1)

  return (
    <CContainer>
      <h2>Importar Lecturas desde CSV</h2>

      {success && <CAlert color="success">{success}</CAlert>}
      {error && <CAlert color="danger">{error}</CAlert>}

      <CForm onSubmit={handleSubmit}>
        <CFormInput type="file" accept=".csv" onChange={handleFileChange} />

        {preview.length > 0 && (
          <div className="mt-4">
            <h5>
              Vista previa (primeras 5 filas) — Total de lecturas detectadas: <strong>{totalRows}</strong>
            </h5>
            <CTable striped responsive>
              <CTableHead>
                <CTableRow>
                  {headers.map((header, idx) => (
                    <CTableHeaderCell key={idx}>{header}</CTableHeaderCell>
                  ))}
                </CTableRow>
              </CTableHead>
              <CTableBody>
                {preview.map((row, idx) => (
                  <CTableRow key={idx}>
                    {headers.map((header, hIdx) => (
                      <CTableDataCell key={hIdx}>{row[header]}</CTableDataCell>
                    ))}
                  </CTableRow>
                ))}
              </CTableBody>
            </CTable>
          </div>
        )}

        <CRow className="mt-3">
          <CCol xs={6}>
            <CButton type="submit" color="primary" disabled={!file}>
              Importar Lecturas
            </CButton>
          </CCol>
          <CCol xs={6} className="text-end">
            <CButton color="secondary" variant="outline" onClick={handleCancel}>
              Cancelar
            </CButton>
          </CCol>
        </CRow>
      </CForm>
    </CContainer>
  )
}

export default LecturaImport
