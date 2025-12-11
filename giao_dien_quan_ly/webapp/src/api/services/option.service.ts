import axiosClient from "../axiosClient";
import { ApiResponse } from "../types/api.response";
import { 
  OptionRequest, 
  OptionResponse, 
  OptionValueRequest, 
  OptionValueResponse 
} from "../types/option.types";

export const optionService = {
  // --- OPTION APIs ---
  
  // GET /options
  getAllOptions: async (): Promise<OptionResponse[]> => {
    const response = await axiosClient.get<any, ApiResponse<OptionResponse[]>>("/options");
    return response.result || [];
  },

  // POST /options
  createOption: async (data: OptionRequest): Promise<OptionResponse> => {
    const response = await axiosClient.post<any, ApiResponse<OptionResponse>>("/options", data);
    return response.result!;
  },

  // DELETE /options/{id}
  deleteOption: async (id: number): Promise<void> => {
    await axiosClient.delete(`/options/${id}`);
  },

  // --- OPTION VALUE APIs ---

  // GET /option_values/{optionId}
  getValuesByOptionId: async (optionId: number): Promise<OptionValueResponse[]> => {
    const response = await axiosClient.get<any, ApiResponse<OptionValueResponse[]>>(`/option_values/${optionId}`);
    return response.result || [];
  },

  // POST /option_values
  createOptionValue: async (data: OptionValueRequest): Promise<OptionValueResponse> => {
    const response = await axiosClient.post<any, ApiResponse<OptionValueResponse>>("/option_values", data);
    return response.result!;
  },

  // DELETE /option_values/{id}
  deleteOptionValue: async (id: number): Promise<void> => {
    await axiosClient.delete(`/option_values/${id}`);
  }
};