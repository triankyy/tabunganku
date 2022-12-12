import BackIcon from "@mui/icons-material/ArrowBackIosNew";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import ArrowDropUpIcon from "@mui/icons-material/ArrowDropUp";
import { Box, Card, IconButton, Typography } from "@mui/joy";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import moment from "moment";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import TabunganLayout from "../../../../layout/layout";
import toRupiah from "../../../../utils/numberFormat";

interface Pemasukan {
    created_at: Date;
    id: number;
    idBukuTabungan: number;
    idProfile: string;
    nominal: number;
    keterangan?: string;
    tipe: boolean;
    profiles: Profile;
}

interface Profile {
    username: string;
}

export default function Pemasukan() {
    const router = useRouter();
    const supabase = useSupabaseClient();
    const { slug } = router.query;

    const [loading, setLoading] = useState<boolean>(false);
    const [pemasukan, setPemasukan] = useState<Pemasukan[]>([]);

    useEffect(() => {
        if (!router.isReady) return;
        getPemasukan(slug);
    }, [router.isReady]);

    async function getPemasukan(idBukuTabungan: any) {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from("pemasukan")
                .select(`*, profiles:idProfile (*)`)
                .eq("idBukuTabungan", idBukuTabungan)
                .eq("tipe", true)
                .order("created_at", { ascending: false });
            if (error) throw error.message;
            console.log(data);
            setPemasukan(data);
            setLoading(false);
        } catch (error) {
            setLoading(false);
            if (typeof error == "string") toast.error(error);
        }
    }

    return (
        <TabunganLayout loading={loading}>
            <Box sx={{ display: "flex", alignItems: "center" }}>
                <IconButton onClick={() => router.back()}>
                    <BackIcon />
                </IconButton>
                <Typography level="h5" sx={{ mx: 2, width: "100%" }}>
                    Detail Pemasukan
                </Typography>
            </Box>
            <Box
                sx={{ my: 5, display: "flex", gap: 2, flexDirection: "column" }}
            >
                {pemasukan.map((p, i) => (
                    <CustomCardAlert flow={p} key={i} />
                ))}
            </Box>
        </TabunganLayout>
    );
}

function CustomCardAlert({ flow }: { flow: Pemasukan }) {
    return (
        <Card
            variant="soft"
            color={flow.tipe ? "success" : "danger"}
            sx={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
            }}
        >
            <Box>
                <Box
                    sx={{
                        display: "flex",
                        alignItems: "center",
                    }}
                >
                    {flow.tipe ? <ArrowDropUpIcon /> : <ArrowDropDownIcon />}
                    <Typography color={flow.tipe ? "success" : "danger"}>
                        {toRupiah(flow.nominal)}
                    </Typography>
                </Box>
                <Box sx={{ my: 1 }}>
                    <Typography color={flow.tipe ? "success" : "danger"}>
                        {flow.profiles.username}{" "}
                        {flow.keterangan ? ` : ${flow.keterangan}` : ""}
                    </Typography>
                </Box>
            </Box>
            <Typography color={flow.tipe ? "success" : "danger"}>
                {moment(flow.created_at).format("DD-MM-YYYY")}
            </Typography>
        </Card>
    );
}
