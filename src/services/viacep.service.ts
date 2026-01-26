import axios from 'axios'

interface ViaCEPResponse {
  cep: string
  logradouro: string
  complemento: string
  bairro: string
  localidade: string
  uf: string
  ibge: string
  gia: string
  ddd: string
  siafi: string
  erro?: boolean
}

export class ViaCEPService {
  private baseUrl = 'https://viacep.com.br/ws'

  /**
   * Busca endereço por CEP
   */
  async getAddressByCep(cep: string): Promise<{
    zipCode: string
    address: string
    neighborhood: string
    city: string
    state: string
    complement?: string
  } | null> {
    try {
      // Remove caracteres não numéricos
      const cleanCep = cep.replace(/\D/g, '')

      if (cleanCep.length !== 8) {
        throw new Error('CEP deve ter 8 dígitos')
      }

      const response = await axios.get<ViaCEPResponse>(
        `${this.baseUrl}/${cleanCep}/json/`
      )

      if (response.data.erro || !response.data.logradouro) {
        return null
      }

      return {
        zipCode: cleanCep,
        address: response.data.logradouro,
        neighborhood: response.data.bairro,
        city: response.data.localidade,
        state: response.data.uf,
        complement: response.data.complemento || undefined,
      }
    } catch (error: any) {
      console.error('Erro ao buscar CEP:', error.message)
      return null
    }
  }

  /**
   * Busca CEPs por endereço (cidade, estado, logradouro)
   */
  async searchCepByAddress(
    state: string,
    city: string,
    address: string
  ): Promise<Array<{
    zipCode: string
    address: string
    neighborhood: string
    city: string
    state: string
  }>> {
    try {
      const cleanState = state.toUpperCase().trim()
      const cleanCity = city.trim()
      const cleanAddress = address.trim()

      const response = await axios.get<ViaCEPResponse[]>(
        `${this.baseUrl}/${cleanState}/${cleanCity}/${cleanAddress}/json/`
      )

      if (!Array.isArray(response.data)) {
        return []
      }

      return response.data
        .filter((item) => !item.erro && item.logradouro)
        .map((item) => ({
          zipCode: item.cep.replace(/\D/g, ''),
          address: item.logradouro,
          neighborhood: item.bairro,
          city: item.localidade,
          state: item.uf,
        }))
    } catch (error: any) {
      console.error('Erro ao buscar CEP por endereço:', error.message)
      return []
    }
  }
}

export const viaCEPService = new ViaCEPService()

