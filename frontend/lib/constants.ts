// Role definitions
export const ROLES = {
    ADMIN: 'admin',
    DIRECTOR: 'director',
    HOD: 'hod',
    FACULTY: 'faculty',
} as const;

export type Role = typeof ROLES[keyof typeof ROLES];

// Role configuration for UI styling
export const ROLE_CONFIG = {
    [ROLES.ADMIN]: {
        label: 'System Admin',
        color: 'bg-rose-500',
        textColor: 'text-rose-700',
        bgLight: 'bg-rose-50',
        borderColor: 'border-rose-200'
    },
    [ROLES.DIRECTOR]: {
        label: 'Director',
        color: 'bg-violet-500',
        textColor: 'text-violet-700',
        bgLight: 'bg-violet-50',
        borderColor: 'border-violet-200'
    },
    [ROLES.HOD]: {
        label: 'Head of Department',
        color: 'bg-blue-500',
        textColor: 'text-blue-700',
        bgLight: 'bg-blue-50',
        borderColor: 'border-blue-200'
    },
    [ROLES.FACULTY]: {
        label: 'Faculty',
        color: 'bg-emerald-500',
        textColor: 'text-emerald-700',
        bgLight: 'bg-emerald-50',
        borderColor: 'border-emerald-200'
    },
};

// User type
export interface User {
    id: string;
    name: string;
    email: string;
    role: Role;
    department?: string;
}

// Demo credentials for login (keep these for testing)
export const MOCK_USERS: Record<string, User> = {
    admin: {
        id: 'ADM001',
        name: 'Rajesh Kumar',
        email: 'admin@college.edu',
        role: ROLES.ADMIN
    },
    director: {
        id: 'DIR001',
        name: 'Dr. Anita Sharma',
        email: 'director@college.edu',
        role: ROLES.DIRECTOR
    },
    hod: {
        id: 'HOD001',
        name: 'Prof. Vikram Singh',
        email: 'hod.cse@college.edu',
        role: ROLES.HOD,
        department: 'Computer Science'
    },
    faculty: {
        id: 'FAC001',
        name: 'Dr. Priya Patel',
        email: 'priya.patel@college.edu',
        role: ROLES.FACULTY,
        department: 'Computer Science'
    },
};

// Departments list
export const DEPARTMENTS = [
    'Computer Science',
    'Electronics',
    'Mechanical',
    'Civil',
    'Electrical',
    'Chemical',
];
