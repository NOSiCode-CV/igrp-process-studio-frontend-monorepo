import { createProjectFunctions } from '../functions/project';
import { createProcessDefinitionFunctions } from '../functions/process-definition';
import {
  ProcessStudioClient,
  ProcessStudioClientConfig,
} from '@igrp/framework-process-studio-types';
import { ProcessStudioApiClient } from '../utils/process-studio-api-client';

export function createProcessStudioClient(config: ProcessStudioClientConfig): ProcessStudioClient {
  const apiClient = new ProcessStudioApiClient({
    baseUrl: config.baseUrl || process.env.NEXT_PUBLIC_API_GATEWAY || '',
    timeout: config.timeout || 30000,
    headers: config.headers || {},
  });
  const projectFunctions = createProjectFunctions(apiClient);
  const processDefinitionFunctions = createProcessDefinitionFunctions(apiClient);

  return {
    projects: {
      getAll: projectFunctions.getProject,
      getById: projectFunctions.getProjectById,
      create: projectFunctions.createProject,
      update: projectFunctions.updateProject,
      createOrUpdate: projectFunctions.createOrUpdateProject,
      enable: projectFunctions.enableProject,
      disable: projectFunctions.disableProject,
      delete: projectFunctions.disableProject,
      getDeployedProcesses: projectFunctions.getDeployedProcesses,
      getProcessHistory: projectFunctions.getProcessHistory,
    },
    processDefinitions: {
      getAll: async () => {
        const projects = await projectFunctions.getProject({ pageNumber: '0', pageSize: '100' });
        return projects.content.flatMap((project) =>
          project.processDefinitions.map((pd) => ({
            ...pd,
            version: pd.version ?? 'N/D',
          })),
        );
      },
      list: processDefinitionFunctions.getProcessDefinitions,
      getById: processDefinitionFunctions.getProcessDefinitionById,
      delete: processDefinitionFunctions.deleteProcessDefinition,
      restore: processDefinitionFunctions.restoreProcessDefinition,
      create: processDefinitionFunctions.createProcessDefinition,
      update: processDefinitionFunctions.updateProcessDefinition,
      createOrUpdate: processDefinitionFunctions.createOrUpdateProcessDefinition,
      saveDiagram: processDefinitionFunctions.saveDiagramProcessDefinition,
      deploy: processDefinitionFunctions.deployProcessDefinition,
      createOrUpdateVariable: processDefinitionFunctions.createOrUpdateVariable,
      getVariables: processDefinitionFunctions.getVariables,
      getStates: processDefinitionFunctions.getProcessDefinitionStates,
    },
  };
}
