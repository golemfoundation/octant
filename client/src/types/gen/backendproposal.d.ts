/* eslint-disable */
/**
 * This file was automatically generated by json-schema-to-typescript.
 * DO NOT MODIFY IT BY HAND. Instead, modify the source JSONSchema file,
 * and run json-schema-to-typescript to regenerate this file.
 */

/**
 * Metadata describing a project proposal for Octant
 */
export interface BackendProposal {
  /**
   * Name of the project proposed for Octant funding
   */
  name: string;
  /**
   * Short description of the project
   */
  introDescription: string;
  /**
   * Detailed description of the project
   */
  description: string;
  /**
   * Profile image of the project (small) 64px
   */
  profileImageSmall: string;
  /**
   * Profile image of the project (medium) 128px
   */
  profileImageMedium?: string;
  /**
   * Profile image of the project (large) 192px
   */
  profileImageLarge?: string;
  /**
   * The version of Backend Proposal schema used to describe this proposal
   */
  version?: string;
  /**
   * Website information
   */
  website: {
    /**
     * Optional label describing website
     */
    label?: string;
    /**
     * URL to the website
     */
    url: string;
    [k: string]: unknown;
  };
}