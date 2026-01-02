export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[]

export interface Database {
    public: {
        Tables: {
            profiles: {
                Row: {
                    id: string
                    email: string
                    first_name: string | null
                    last_name: string | null
                    full_name: string | null
                    avatar_url: string | null
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id: string
                    email: string
                    first_name?: string | null
                    last_name?: string | null
                    full_name?: string | null
                    avatar_url?: string | null
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    email?: string
                    first_name?: string | null
                    last_name?: string | null
                    full_name?: string | null
                    avatar_url?: string | null
                    created_at?: string
                    updated_at?: string
                }
            }
            groups: {
                Row: {
                    id: string
                    name: string
                    description: string | null
                    created_at: string
                    created_by: string
                    currency: string
                }
                Insert: {
                    id?: string
                    name: string
                    description?: string | null
                    created_at?: string
                    created_by: string
                    currency?: string
                }
                Update: {
                    id?: string
                    name?: string
                    description?: string | null
                    created_at?: string
                    created_by?: string
                    currency?: string
                }
            }
            group_members: {
                Row: {
                    id: string
                    group_id: string
                    user_id: string
                    joined_at: string
                    role: 'admin' | 'member'
                }
                Insert: {
                    id?: string
                    group_id: string
                    user_id: string
                    joined_at?: string
                    role?: 'admin' | 'member'
                }
                Update: {
                    id?: string
                    group_id?: string
                    user_id?: string
                    joined_at?: string
                    role?: 'admin' | 'member'
                }
            }
            expenses: {
                Row: {
                    id: string
                    group_id: string
                    title: string
                    amount: number
                    category: string
                    description: string | null
                    paid_by: string
                    bill_image_url: string | null
                    created_at: string
                    expense_date: string
                }
                Insert: {
                    id?: string
                    group_id: string
                    title: string
                    amount: number
                    category: string
                    description?: string | null
                    paid_by: string
                    bill_image_url?: string | null
                    created_at?: string
                    expense_date?: string
                }
                Update: {
                    id?: string
                    group_id?: string
                    title?: string
                    amount?: number
                    category?: string
                    description?: string | null
                    paid_by?: string
                    bill_image_url?: string | null
                    created_at?: string
                    expense_date?: string
                }
            }
            expense_splits: {
                Row: {
                    id: string
                    expense_id: string
                    user_id: string
                    amount: number
                    percentage: number | null
                    shares: number | null
                }
                Insert: {
                    id?: string
                    expense_id: string
                    user_id: string
                    amount: number
                    percentage?: number | null
                    shares?: number | null
                }
                Update: {
                    id?: string
                    expense_id?: string
                    user_id?: string
                    amount?: number
                    percentage?: number | null
                    shares?: number | null
                }
            }
            settlements: {
                Row: {
                    id: string
                    group_id: string
                    from_user_id: string
                    to_user_id: string
                    amount: number
                    settled_at: string
                    note: string | null
                }
                Insert: {
                    id?: string
                    group_id: string
                    from_user_id: string
                    to_user_id: string
                    amount: number
                    settled_at?: string
                    note?: string | null
                }
                Update: {
                    id?: string
                    group_id?: string
                    from_user_id?: string
                    to_user_id?: string
                    amount?: number
                    settled_at?: string
                    note?: string | null
                }
            }
        }
    }
}
