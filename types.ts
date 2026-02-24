
export interface Attachment {
    id: string | number;
    data: string; // base64
    mimeType: string;
    name?: string;
}

export interface Message {
    id: number;
    sender: 'user' | 'ai';
    name?: string;
    avatar?: string;
    text: string;
    attachments?: Attachment[];
}

export interface UserProfile {
    name: string;
    avatar: string;
    theme: string;
}

export interface Format {
    id: string;
    name: string;
    description: string;
}

export interface Shortcut {
    name: string;
    url: string;
}
