import type {
  Project,
  PaginatedResponse,
  ProjectFilter,
  ProjectProcessFilter,
} from '@igrp/framework-process-studio-types';
import { ProcessStudioApiClient } from '../utils/process-studio-api-client';

export const createProjectFunctions = (apiClient: ProcessStudioApiClient) => {
  return {
    getProject: async (filter?: ProjectFilter): Promise<PaginatedResponse<Project>> => {
      return apiClient.getProjects(filter);
    },

    getProjectById: async (projectId: string): Promise<Project> => {
      return apiClient.getProjectById(projectId);
    },

    createOrUpdateProject: async (project: Project): Promise<Project> => {
      if (project.projectId) {
        return apiClient.updateProject(project);
      } else {
        return apiClient.createProject(project);
      }
    },

    createProject: async (project: Project): Promise<Project> => {
      return apiClient.createProject(project);
    },

    updateProject: async (project: Project): Promise<Project> => {
      return apiClient.updateProject(project);
    },

    enableProject: async (projectId: string): Promise<unknown> => {
      return apiClient.enableProject(projectId);
    },

    disableProject: async (projectId: string): Promise<unknown> => {
      return apiClient.disableProject(projectId);
    },

    getDeployedProcesses: async (
      projectId: string,
      filter?: ProjectProcessFilter,
    ): Promise<Project> => {
      return apiClient.getDeployedProcesses(projectId, filter);
    },

    getProcessHistory: async (
      projectId: string,
      filter?: ProjectProcessFilter,
    ): Promise<Project> => {
      return apiClient.getProcessHistory(projectId, filter);
    },
  };
};
