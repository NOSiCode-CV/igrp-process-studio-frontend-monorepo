import type { ProcessDefinition, VariableDefinition } from '@igrp/framework-process-studio-types';
import { ProcessDefinitionContent } from '@igrp/framework-process-studio-types';
import { ProcessStudioApiClient } from '../utils/process-studio-api-client';

export const createProcessDefinitionFunctions = (apiClient: ProcessStudioApiClient) => {
  return {
    getProcessDefinitionById: async (processDefinitionId: string): Promise<ProcessDefinition> => {
      return apiClient.getProcessDefinitionById(processDefinitionId);
    },

    deleteProcessDefinition: async (processDefinitionId: string): Promise<any> => {
      return apiClient.deleteProcessDefinition(processDefinitionId);
    },

    createProcessDefinition: async (
      projectId: string,
      processDefinition: ProcessDefinition,
    ): Promise<ProcessDefinition> => {
      return apiClient.createProcessDefinition(projectId, processDefinition);
    },

    updateProcessDefinition: async (
      projectId: string,
      processDefinition: ProcessDefinition,
    ): Promise<ProcessDefinition> => {
      return apiClient.updateProcessDefinition(projectId, processDefinition);
    },

    createOrUpdateProcessDefinition: async (
      processDefinition: ProcessDefinition,
    ): Promise<ProcessDefinition> => {
      const { processDefinitionId, ...rest } = processDefinition;
      if (processDefinition.processDefinitionId) {
        return apiClient.updateProcessDefinition(processDefinition.projectId, rest);
      } else {
        return apiClient.createProcessDefinition(processDefinition.projectId, processDefinition);
      }
    },

    saveDiagramProcessDefinition: async (
      processkey: string,
      processDefinition: ProcessDefinitionContent,
    ): Promise<any> => {
      return apiClient.saveDiagramProcessDefinition(processkey, processDefinition);
    },

    deployProcessDefinition: async (
      processkey: string,
      processDefinition: ProcessDefinitionContent,
    ): Promise<any> => {
      return apiClient.deployProcessDefinition(processkey, processDefinition);
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
  };
};
