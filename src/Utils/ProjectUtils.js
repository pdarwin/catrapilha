import ProjectConfig from "../Config/ProjectConfig";

/**
 * Retrieves a project configuration by its ID.
 * @param {string} projectId - The ID of the project to retrieve.
 * @returns {Object} - The project configuration object.
 * @throws Will throw an error if the project ID is not found.
 */
export const getProject = projectId => {
  const project = ProjectConfig[projectId];

  if (!project) {
    throw new Error(`No project configured with ID ${projectId}`);
  }

  return project;
};
