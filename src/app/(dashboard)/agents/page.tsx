import { auth } from "@/lib/auth";
import { loadSearchParams } from "@/modules/agents/params";
import { AgentsListHeader } from "@/modules/agents/ui/components/agents-list-header";
import { AgentsView, AgentsViewError, AgentsViewLoading } from "@/modules/agents/ui/views/agents-view"
import { getQueryClient, trpc } from "@/trpc/server";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { SearchParams } from "nuqs";
import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";

// We Used Server Components to prefetch the agents getMany query
// and then passed the dehydrated state to the client component
// This improves the performance and SEO of the page
// as the data is fetched on the server and sent to the client
// instead of fetching the data on the client
// This also reduces the load on the client as the data is already available
// when the client component is rendered
// This is a great way to use the power of React Query and TRPC together
// to build fast and SEO friendly applications with Next.js 13

interface Props {
    searchParams: Promise<SearchParams>;
};

const Page = async ({ searchParams }: Props) => {
    const filters = await loadSearchParams(searchParams);

    const session = await auth.api.getSession ({
        headers: await headers(),
    });
    
    if (!session) {
        redirect("/sign-in");
    }

    const queryClient = getQueryClient();
    void queryClient.prefetchQuery(trpc.agents.getMany.queryOptions({
        ...filters
    }));

    return (
        <>
            <AgentsListHeader />
            <HydrationBoundary state = {dehydrate(queryClient)}>
                <Suspense fallback={<AgentsViewLoading />}>
                    <ErrorBoundary fallback={<AgentsViewError />}>
                        <AgentsView />
                    </ErrorBoundary>
                </Suspense>
            </HydrationBoundary>
        </>
    );
};

export default Page;
