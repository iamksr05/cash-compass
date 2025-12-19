
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Transaction, BusinessInfo, BurnCategory } from '@/types/cashflow';
import { useAuth } from '@/hooks/useAuth';
import { mockBusinessInfo, mockTransactions } from '@/lib/mockData';
import { useToast } from '@/hooks/use-toast';

export interface ExtendedBusinessInfo extends BusinessInfo {
    id: string;
}

const DEMO_EMAIL = 'demo@cashflow.com';

export function useCashflowData() {
    const { user } = useAuth();
    const queryClient = useQueryClient();
    const { toast } = useToast();

    const isDemo = user?.email === DEMO_EMAIL;

    const { data: businessInfo, isLoading: loadingBusiness } = useQuery({
        queryKey: ['businessInfo', user?.id],
        queryFn: async () => {
            if (!user) return null;

            if (isDemo) {
                // Return mock data for demo user
                return mockBusinessInfo;
            }

            const { data, error } = await supabase
                .from('businesses')
                .select('*')
                .eq('user_id', user.id)
                .maybeSingle();

            if (error) throw error;
            if (!data) return null;

            return {
                id: data.id,
                name: data.name,
                type: data.type as any,
                currency: data.currency as any,
                startingBalance: data.starting_balance,
                monthlyFixedExpenses: data.monthly_fixed_expenses,
            } as ExtendedBusinessInfo;
        },
        enabled: !!user,
    });

    const { data: transactions, isLoading: loadingTransactions } = useQuery({
        queryKey: ['transactions', user?.id],
        queryFn: async () => {
            if (!user) return [];

            if (isDemo) {
                return mockTransactions;
            }

            const { data, error } = await supabase
                .from('transactions')
                .select('*')
                .eq('user_id', user.id)
                .order('date', { ascending: false });

            if (error) throw error;

            return data.map(t => ({
                id: t.id,
                type: t.type as 'income' | 'expense',
                amount: t.amount,
                date: t.date,
                category: t.category as any,
                description: t.description || '',
                isRecurring: t.is_recurring,
                recurringFrequency: t.recurring_frequency as any,
                burnCategory: t.burn_category as BurnCategory,
                isExperiment: t.is_experiment || false,
                isFounderDraw: t.is_founder_draw || false,
                experimentNotes: t.experiment_notes || undefined,
            })) as Transaction[];
        },
        enabled: !!user,
    });

    const addTransactionMutation = useMutation({
        mutationFn: async (newTransaction: Omit<Transaction, 'id'>) => {
            if (!user) throw new Error('No user');

            if (isDemo) {
                // Fake delay for demo
                await new Promise(resolve => setTimeout(resolve, 500));
                return null;
            }

            if (!businessInfo?.id) throw new Error('No business found');

            const { data, error } = await supabase.from('transactions').insert({
                user_id: user.id,
                business_id: businessInfo.id,
                type: newTransaction.type,
                amount: newTransaction.amount,
                date: newTransaction.date,
                category: newTransaction.category,
                description: newTransaction.description,
                is_recurring: newTransaction.isRecurring,
                recurring_frequency: newTransaction.recurringFrequency,
                burn_category: newTransaction.burnCategory || null,
                is_experiment: newTransaction.isExperiment || false,
                is_founder_draw: newTransaction.isFounderDraw || false,
                experiment_notes: newTransaction.experimentNotes || null,
                is_fixed: false,
            }).select().single();

            if (error) throw error;
            return data;
        },
        onSuccess: () => {
            if (isDemo) {
                toast({
                    title: "Demo Mode",
                    description: "Transaction simulated. Sign up to save real data!",
                });
            } else {
                queryClient.invalidateQueries({ queryKey: ['transactions'] });
            }
        }
    });

    const updateBusinessInfo = useMutation({
        mutationFn: async (info: BusinessInfo) => {
            if (!user) throw new Error('No user');

            if (isDemo) {
                await new Promise(resolve => setTimeout(resolve, 500));
                return;
            }

            if (!businessInfo?.id) throw new Error('No business found');

            const { error } = await supabase
                .from('businesses')
                .update({
                    name: info.name,
                    type: info.type,
                    currency: info.currency,
                    starting_balance: info.startingBalance,
                    monthly_fixed_expenses: info.monthlyFixedExpenses,
                })
                .eq('id', businessInfo.id);

            if (error) throw error;
        },
        onSuccess: () => {
            if (isDemo) {
                toast({
                    title: "Demo Mode",
                    description: "Settings simulated. Sign up to save changes!",
                });
            } else {
                queryClient.invalidateQueries({ queryKey: ['businessInfo'] });
            }
        }
    });

    return {
        businessInfo,
        transactions: transactions || [],
        isLoading: loadingBusiness || loadingTransactions,
        addTransaction: addTransactionMutation.mutate,
        isAddingTransaction: addTransactionMutation.isPending,
        updateBusinessInfo: updateBusinessInfo.mutate,
        isUpdatingBusinessInfo: updateBusinessInfo.isPending,
        isDemo,
    };
}
