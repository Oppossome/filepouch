// This file is auto-generated by @hey-api/openapi-ts

import { createClient, createConfig, type OptionsLegacyParser } from '@hey-api/client-fetch';
import type { GetUploadsData, GetUploadsError, GetUploadsResponse, GetUploadData, GetUploadError, GetUploadResponse, UploadFilesError, UploadFilesResponse } from './types.gen';

export const client = createClient(createConfig());

/**
 * Returns uploads and the user who uploaded them.
 */
export const getUploads = <ThrowOnError extends boolean = false>(options?: OptionsLegacyParser<GetUploadsData, ThrowOnError>) => {
    return (options?.client ?? client).get<GetUploadsResponse, GetUploadsError, ThrowOnError>({
        ...options,
        url: '/api/uploads'
    });
};

/**
 * Returns an upload's details and the user who uploaded it by its ID.
 */
export const getUpload = <ThrowOnError extends boolean = false>(options: OptionsLegacyParser<GetUploadData, ThrowOnError>) => {
    return (options?.client ?? client).get<GetUploadResponse, GetUploadError, ThrowOnError>({
        ...options,
        url: '/api/uploads/{upload_id}'
    });
};

export const uploadFiles = <ThrowOnError extends boolean = false>(options?: OptionsLegacyParser<unknown, ThrowOnError>) => {
    return (options?.client ?? client).post<UploadFilesResponse, UploadFilesError, ThrowOnError>({
        ...options,
        url: '/api/uploads:upload'
    });
};