import BackIcon from "@mui/icons-material/ArrowBackIosNew";
import {
    Box,
    Button,
    FormControl,
    FormLabel,
    IconButton,
    Textarea,
    TextField,
    Typography,
} from "@mui/joy";
import { Skeleton } from "@mui/material";
import { useSupabaseClient, Session } from "@supabase/auth-helpers-react";
import { useRouter } from "next/router";
import { ChangeEvent, useEffect, useState } from "react";
import { toast } from "react-toastify";
import TabunganLayout from "../../../../layout/layout";
import toRupiah from "../../../../utils/numberFormat";

interface UserTabungan {
    created_at: Date;
    id: number;
    idBukuTabungan: number;
    idProfile: string;
    bukuTabungan: Tabungan;
}

interface Tabungan {
    created_at: Date;
    id: number;
    name: string;
    referal: string;
    value: number;
}

export default function PemasukanAdd() {
    const router = useRouter();
    const { slug } = router.query;

    const supabase = useSupabaseClient();

    const [loading, setLoading] = useState<boolean>(false);
    const [tabungan, setTabungan] = useState<Tabungan | null>(null);

    const [nominal, setNominal] = useState<string>("");
    const [displayNominal, setDisplayNominal] = useState<string>("");

    const [keterangan, setKeterangan] = useState<string>("");

    const [session, setSession] = useState<Session | null>(null);

    useEffect(() => {
        if (!router.isReady) return;
        getTabungan(slug as string);
        getUserSession();
    }, [router.isReady]);

    async function getTabungan(id: string) {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from("bukuTabungan")
                .select("*")
                .eq("id", id)
                .limit(1)
                .single();
            if (error) throw error.message;
            setTabungan(data);
            setLoading(false);
        } catch (error) {
            setLoading(false);
            if (typeof error == "string") toast.error(error);
        }
    }

    async function getUserSession(): Promise<void> {
        try {
            const {
                data: { session },
            } = await supabase.auth.getSession();
            if (session) {
                setSession(session);
            } else throw null;
        } catch (error) {
            router.push("/auth/login");
        }
    }

    async function addPemasukan() {
        try {
            setLoading(true);
            const { error: errorTabungan } = await supabase
                .from("bukuTabungan")
                .update({ value: Number(tabungan?.value) + +nominal })
                .eq("id", slug);
            if (errorTabungan) throw errorTabungan.message;
            const { error: errorPemasukan } = await supabase
                .from("pemasukan")
                .insert({
                    nominal: +nominal,
                    idBukuTabungan: slug,
                    idProfile: session?.user.id,
                    keterangan,
                    tipe: true,
                });
            if (errorPemasukan) throw errorPemasukan.message;
            setLoading(false);
            toast.success("Pemasukan Berhasil ditambahkan");
            router.back();
        } catch (error) {
            setLoading(false);
            if (typeof error == "string") toast.error(error);
        }
    }

    function handleInputNominal(evt: ChangeEvent<HTMLInputElement>) {
        evt.preventDefault();
        setNominal(evt.target.value);
        setDisplayNominal(toRupiah(+evt.target.value));
    }

    function handleKeterangan(evt: ChangeEvent<HTMLTextAreaElement>) {
        evt.preventDefault();
        setKeterangan(evt.target.value);
    }

    return (
        <TabunganLayout loading={loading}>
            <Box sx={{ display: "flex", alignItems: "center" }}>
                <IconButton onClick={() => router.back()}>
                    <BackIcon />
                </IconButton>
                <Typography level="h5" sx={{ mx: 2, width: "100%" }}>
                    {loading ? (
                        <Skeleton />
                    ) : (
                        `Add Pemasukan ${tabungan?.name ?? ""}`
                    )}
                </Typography>
            </Box>
            <Box sx={{ my: 5 }}>
                <Box
                    component="form"
                    onSubmit={(e) => alert(e.target)}
                    sx={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 2,
                        mb: 5,
                    }}
                >
                    <TextField
                        required
                        label="Nominal"
                        placeholder="Masukkan nominal pemasukan"
                        type="number"
                        onChange={handleInputNominal}
                        value={nominal}
                        helperText={`Nominal yang akan ditambahkan : ${displayNominal}`}
                    />
                    <FormControl>
                        <FormLabel>Keterangan</FormLabel>
                        <Textarea
                            minRows={3}
                            placeholder="Optional"
                            onChange={handleKeterangan}
                        />
                    </FormControl>
                    <Button
                        fullWidth
                        loading={loading}
                        loadingIndicator="Loading..."
                        onClick={addPemasukan}
                    >
                        Simpan
                    </Button>
                </Box>
            </Box>
        </TabunganLayout>
    );
}
