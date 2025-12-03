import Card from '@/Components/Card';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import { CheckIcon, Loader, Pause, Search } from 'lucide-react';

export default function Dashboard() {
    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800">
                    Dashboard
                </h2>
            }
        >
            <Head title="Dashboard" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl px-6 lg:px-8">
                    <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
                        <Card color="bg-success">
                            <div className="flex items-center justify-between">
                                <div className='text-white'>
                                    <div className="text-4xl font-bold">1213</div>
                                    <div className="mt-2 text-sm opacity-90">Publish News</div>
                                </div>

                                <div className="text-2xl opacity-70">
                                    <CheckIcon  className={`w-16 h-16 text-success-content`} />
                                </div>
                            </div>
                        </Card>
                         <Card color="bg-warning">
                            <div className="flex items-center justify-between">
                                <div className='text-white'>
                                    <div className="text-4xl font-bold">1213</div>
                                    <div className="mt-2 text-sm opacity-90">On Reviews News</div>
                                </div>

                                <div className="text-2xl opacity-70">
                                    <Search className={`w-16 h-16 text-warning-content`} />
                                </div>
                            </div>
                        </Card>
                         <Card color="bg-error">
                            <div className="flex items-center justify-between">
                                <div className='text-white'>
                                    <div className="text-4xl font-bold">1213</div>
                                    <div className="mt-2 text-sm opacity-90">On Progress News</div>
                                </div>

                                <div className="text-2xl opacity-70">
                                    <Loader  className={`w-16 h-16 text-error-content`} />
                                </div>
                            </div>
                        </Card>
                         <Card color="bg-secondary">
                            <div className="flex items-center justify-between">
                                <div className='text-white'>
                                    <div className="text-4xl font-bold">1213</div>
                                    <div className="mt-2 text-sm opacity-90">Pending News</div>
                                </div>

                                <div className="text-2xl opacity-70">
                                    <Pause  className={`w-16 h-16 text-secondary-content`} />
                                </div>
                            </div>
                        </Card>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
