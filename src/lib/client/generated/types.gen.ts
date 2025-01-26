// This file is auto-generated by @hey-api/openapi-ts

export type GetUploadsData = {
    query?: {
        page_size?: unknown;
        page_token?: unknown;
        user_id?: unknown;
    };
};

export type GetUploadsResponse = ({
    uploads: Array<{
        id: string;
        createdAt: Date;
        updatedAt: (Date) | null;
        fileName: string;
        fileSize: number;
        fileType: string;
        fileAspectRatio: number;
        userId: string;
        user: {
            id: string;
            createdAt: Date;
            updatedAt: (Date) | null;
            username: string;
        };
    }>;
    next_page_token?: (Date & string);
});

export type GetUploadsError = unknown;

export type GetUploadData = {
    path: {
        upload_id: unknown;
    };
};

export type GetUploadResponse = ({
    upload: {
        id: string;
        createdAt: Date;
        updatedAt: (Date) | null;
        fileName: string;
        fileSize: number;
        fileType: string;
        fileAspectRatio: number;
        userId: string;
        user: {
            id: string;
            createdAt: Date;
            updatedAt: (Date) | null;
            username: string;
        };
    };
});

export type GetUploadError = (unknown);

export type UploadFilesResponse = ({
    uploads: Array<{
        id: string;
        createdAt: Date;
        updatedAt: (Date) | null;
        fileName: string;
        fileSize: number;
        fileType: string;
        fileAspectRatio: number;
        userId: string;
        user: {
            id: string;
            createdAt: Date;
            updatedAt: (Date) | null;
            username: string;
        };
    }>;
});

export type UploadFilesError = (unknown);

export type GetUploadResponseTransformer = (data: any) => Promise<GetUploadResponse>;

export const GetUploadResponseTransformer: GetUploadResponseTransformer = async (data) => {
    if (data?.upload?.createdAt) {
        data.upload.createdAt = new Date(data.upload.createdAt);
    }
    if (data?.upload?.updatedAt) {
        data.upload.updatedAt = new Date(data.upload.updatedAt);
    }
    if (data?.upload?.user?.createdAt) {
        data.upload.user.createdAt = new Date(data.upload.user.createdAt);
    }
    if (data?.upload?.user?.updatedAt) {
        data.upload.user.updatedAt = new Date(data.upload.user.updatedAt);
    }
    return data;
};