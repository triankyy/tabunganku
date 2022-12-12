import { ChangeEvent, useEffect, useState } from "react";
import { Session, useSupabaseClient } from "@supabase/auth-helpers-react";
import { useRouter } from "next/router";
import {
    Box,
    Typography,
    Container,
    Button,
    Card,
    Grid,
    AspectRatio,
    Avatar,
    TextField,
    IconButton,
} from "@mui/joy";
import { alpha } from "@mui/material";
import BackIcon from "@mui/icons-material/ArrowBackIosNew";
import TabunganLayout from "../../layout/layout";
import { toast } from "react-toastify";
import { v4 as uuidv4 } from "uuid";

export default function AddTabungan() {
    const supabase = useSupabaseClient();
    const router = useRouter();

    const [session, setSession] = useState<Session | null>(null);
    const [scrolled, setScrolled] = useState<boolean>(false);

    const [name, setName] = useState<string>("");

    useEffect(() => {
        getUserSession();
        supabase.auth.onAuthStateChange((_event, session) => {
            if (session) {
                setSession(session);
            } else return router.push("/auth/login");
        });
        window.addEventListener("scroll", handleScroll);
    }, []);

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

    function handleScroll(): void {
        if (window.scrollY >= 20) {
            setScrolled(true);
        } else {
            setScrolled(false);
        }
    }

    function handleChange(evt: ChangeEvent<HTMLInputElement>) {
        if (evt.target.value.length <= 15) {
            setName(evt.target.value);
        } else {
            toast.error("Nama tabungan maksimal 15 karakter");
        }
    }

    async function onSubmit() {
        try {
            const { data, error } = await supabase.rpc("insert_buku_tabungan", {
                name,
                referal: uuidv4(),
                user_id: session?.user.id,
            });
            if (error) return toast.error(error.message);
            else {
                toast.success("Berhasil Membuat Tabungan Baru!");
                router.replace("/");
            }
        } catch (error) {
            toast.error("Terjadi Kesalahan Pada Server!");
        }
    }

    return (
        <>
            <TabunganLayout>
                <Box sx={{ display: "flex", alignItems: "center" }}>
                    <IconButton onClick={() => router.back()}>
                        <BackIcon />
                    </IconButton>
                    <Typography level="h5" sx={{ mx: 2 }}>
                        Tambah Tabungan Baru
                    </Typography>
                </Box>
                <Box sx={{ my: 5 }}>
                    <TextField
                        label="Nama Tabungan"
                        name="name"
                        required
                        helperText="Maksimal 15 karakter"
                        onChange={handleChange}
                        value={name}
                    />
                    <Button
                        sx={{ my: 2 }}
                        fullWidth
                        type="submit"
                        onClick={onSubmit}
                    >
                        Tambahkan
                    </Button>
                </Box>
            </TabunganLayout>
        </>
    );
}
