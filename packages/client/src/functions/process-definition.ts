import type {
  PaginatedResponse,
  ProcessDefinition,
  ProcessDefinitionFilter,
  VariableDefinition,
  EnumItem,
} from '@igrp/framework-process-studio-types';
import { ProcessDefinitionContent } from '@igrp/framework-process-studio-types';
import { ProcessStudioApiClient } from '../utils/process-studio-api-client';

export const createProcessDefinitionFunctions = (apiClient: ProcessStudioApiClient) => {
  return {
    getProcessDefinitions: async (
      filter?: ProcessDefinitionFilter,
    ): Promise<PaginatedResponse<ProcessDefinition>> => {
      return apiClient.getProcessDefinitions(filter);
    },

    getProcessDefinitionById: async (processDefinitionId: string): Promise<ProcessDefinition> => {
      return apiClient.getProcessDefinitionById(processDefinitionId);
    },

    deleteProcessDefinition: async (processDefinitionId: string): Promise<unknown> => {
      return apiClient.deleteProcessDefinition(processDefinitionId);
    },

    restoreProcessDefinition: async (processDefinitionId: string): Promise<unknown> => {
      return apiClient.restoreProcessDefinition(processDefinitionId);
    },

    createProcessDefinition: async (
      projectId: string,
      processDefinition: ProcessDefinition,
    ): Promise<ProcessDefinition> => {
      return apiClient.createProcessDefinition(projectId, processDefinition);
    },

    updateProcessDefinition: async (
      processId: string,
      processDefinition: ProcessDefinition,
    ): Promise<ProcessDefinition> => {
      return apiClient.updateProcessDefinition(processId, processDefinition);
    },

    createOrUpdateProcessDefinition: async (
      processDefinition: ProcessDefinition,
    ): Promise<ProcessDefinition> => {
      if (processDefinition.processDefinitionId) {
        return apiClient.updateProcessDefinition(
          processDefinition.processDefinitionId,
          processDefinition,
        );
      } else {
        return apiClient.createProcessDefinition(processDefinition.projectId, processDefinition);
      }
    },

    saveDiagramProcessDefinition: async (
      processKey: string,
      processDefinition: ProcessDefinitionContent,
    ): Promise<ProcessDefinition> => {
      return apiClient.saveDiagramProcessDefinition(processKey, processDefinition);
    },

    deployProcessDefinition: async (
      processKey: string,
      processDefinition: ProcessDefinitionContent,
    ): Promise<ProcessDefinition> => {
      return apiClient.deployProcessDefinition(processKey, processDefinition);
    },

    createOrUpdateVariable: async (
      processDefinitionId: string,
      variable: VariableDefinition[],
    ): Promise<VariableDefinition[]> => {
      return apiClient.createOrUpdateVariable(processDefinitionId, variable);
    },

    getVariables: async (processDefinitionId: string): Promise<VariableDefinition[]> => {
      return apiClient.getVariables(processDefinitionId);
    },

    getProcessDefinitionStates: async (): Promise<EnumItem[]> => {
      return apiClient.getProcessDefinitionStates();
    },
  };
};
