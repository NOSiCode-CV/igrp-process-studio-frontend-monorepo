import { BaseApiClient } from './base-api-client';
import { ApiClientConfig, ProcessDefinitionUpdate } from './types';
import type {
  ProcessDefinition,
  Project,
  PaginatedResponse,
  ProcessDefinitionContent,
  VariableDefinition,
} from '@igrp/framework-process-studio-types';

export class ProcessStudioApiClient extends BaseApiClient {
  constructor(config: ApiClientConfig) {
    super(config);
  }

  // Project endpoints
  async getProjects(): Promise<PaginatedResponse<Project>> {
    const response = await this.get<PaginatedResponse<Project>>('/api/v1/projects');
    return response.data;
  }

  async getProjectById(projectId: string): Promise<Project> {
    const response = await this.get<Project>(`/api/v1/projects/${projectId}`);
    return response.data;
  }

  async createProject(project: Project): Promise<Project> {
    const response = await this.post<Project>('/api/v1/projects', project);
    return response.data;
  }

  async updateProject(project: Project): Promise<Project> {
    const response = await this.put<Project>('/api/v1/projects', project);
    return response.data;
  }

  async deleteProject(code: string): Promise<any> {
    const response = await this.delete<any>(`/api/v1/projects/${code}`);
    return response.data;
  }

  // Process Definition endpoints
  async getProcessDefinitionById(processDefinitionId: string): Promise<ProcessDefinition> {
    const response = await this.get<ProcessDefinition>(
      `/api/v1/projects/process-definitions/${processDefinitionId}`,
    );
    return response.data;
  }

  async deleteProcessDefinition(processDefinitionId: string): Promise<any> {
    const response = await this.patch<any>(
      `/api/v1/projects/process-definitions/${processDefinitionId}/delete`,
    );
    return response.data;
  }

  async createProcessDefinition(
    projectId: string,
    processDefinition: ProcessDefinition,
  ): Promise<ProcessDefinition> {
    const response = await this.post<ProcessDefinition>(
      `/api/v1/projects/${projectId}/process-definitions`,
      processDefinition,
    );
    return response.data;
  }

  async updateProcessDefinition(
    projectId: string,
    processDefinition: ProcessDefinitionUpdate,
  ): Promise<ProcessDefinition> {
    const response = await this.put<ProcessDefinition>(
      `/api/v1/projects/process-definitions/${projectId}`,
      processDefinition,
    );
    return response.data;
  }

  async saveDiagramProcessDefinition(
    processkey: string,
    processDefinition: ProcessDefinitionContent,
  ): Promise<any> {
    const response = await this.put<any>(
      `/api/v1/projects/process-definitions/${processkey}/diagram`,
      processDefinition,
    );
    return response.data;
  }

  async deployProcessDefinition(
    processkey: string,
    processDefinition: ProcessDefinitionContent,
  ): Promise<any> {
    const response = await this.post<any>(
      `/api/v1/projects/process-definitions/${processkey}/deploy`,
      processDefinition,
    );
    return response.data;
  }

  async createOrUpdateVariable(
    processDefinitionId: string,
    variable: VariableDefinition[],
  ): Promise<VariableDefinition[]> {
    const response = await this.post<VariableDefinition[]>(
      `/api/v1/projects/process-definitions/${processDefinitionId}/variables`,
      variable,
    );
    return response.data;
  }

  async getVariables(processDefinitionId: string): Promise<VariableDefinition[]> {
    const response = await this.get<VariableDefinition[]>(
      `/api/v1/projects/process-definitions/${processDefinitionId}/variables`,
    );
    return response.data;
  }
}
