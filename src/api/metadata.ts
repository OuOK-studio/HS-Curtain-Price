import { useQuery } from "@tanstack/vue-query";
import axios from "axios";
import { ApiResponse, Metadata } from "../types.ts";

async function getMetadata() {
    const response = await axios.get<ApiResponse<Metadata>>("https://script.google.com/macros/s/AKfycbx5D5ac79GlNQIESZ9ogcZQVBzcGNOWMF8A3DmooVHEmlvRJqj3sJAqt-G8SECd0IDY/exec", {
        params: { action: "metadata" }
    });
    const data = response.data;
    if (data.success) return data.data;
    throw Error(data.error)
}


export function useMetadata() {
    const { data: metadata, isFetching } = useQuery({
        queryKey: ["metadata"],
        queryFn: () => getMetadata(),
        staleTime: Infinity,
        refetchOnWindowFocus: false
    });

    return { metadata, isFetching }
}