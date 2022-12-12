import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import { Box, Button, TextField, Typography, Container } from "@mui/joy";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import Head from "next/head";
import Image from "next/image";
import { useRouter } from "next/router";
import { ChangeEvent, useEffect, useState } from "react";
import { toast } from "react-toastify";
import docLogo from "/public/doc.svg";

interface UserRegister {
    email: string;
    password: string;
    username: string;
}

export default function Register() {
    const supabase = useSupabaseClient();
    const router = useRouter();

    const [loading, setLoading] = useState<boolean>(false);

    const [user, setUser] = useState<UserRegister>({
        email: "",
        password: "",
        username: "",
    });

    async function signUp(): Promise<void> {
        const { email, password, username } = user;
        try {
            setLoading(true);
            const { data, error } = await supabase.auth.signUp({
                email,
                password,
                options: { data: { username } },
            });
            if (error) throw error.message;
            setLoading(false);
            router.replace("/");
            toast.success(
                `${data.user?.email} Berhasil Didaftarkan, Silahkan Cek Email Untuk Konfirmasi!`
            );
            return;
        } catch (error) {
            setLoading(false);
            toast.error(typeof error == "string" ? error : "");
        }
    }

    function handleChange(evt: ChangeEvent<HTMLInputElement>) {
        setUser((prev) => ({ ...prev, [evt.target.name]: evt.target.value }));
    }

    async function getUserSession(): Promise<void> {
        try {
            const {
                data: { session },
            } = await supabase.auth.getSession();
            if (session) {
                router.push("/");
            }
        } catch (error) {
            router.push("/auth/login");
        }
    }

    useEffect(() => {
        getUserSession();
        supabase.auth.onAuthStateChange((_event, session) => {
            if (session) {
                return router.push("/");
            }
        });
    }, []);

    return (
        <>
            <Head>
                <title>Tabunganku | Register</title>
            </Head>
            <Container maxWidth="sm" sx={{ minHeight: "100vh" }}>
                <Box
                    sx={{
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        minHeight: "100vh",
                        flexDirection: "column",
                        my: 2,
                    }}
                >
                    <Box sx={{ width: "100%", mb: 3 }}>
                        <Box sx={{ position: "sticky" }}>
                            <Button
                                variant="plain"
                                startDecorator={<ArrowBackIosNewIcon />}
                                onClick={() =>
                                    "from" in router.query &&
                                    router.query.from == "/auth/login"
                                        ? router.back()
                                        : router.replace("/auth/login")
                                }
                            >
                                LOGIN
                            </Button>
                        </Box>
                    </Box>
                    <Box sx={{ textAlign: "center", width: "100%" }}>
                        <Typography level="h4">Tabunganku</Typography>
                        <Typography textColor="GrayText">
                            Aplikasi Pencatat Tabungan Tanpa Ribet
                        </Typography>
                        <Box sx={{ my: 3 }}>
                            <Image
                                src={docLogo}
                                alt="Logo Tabunganku"
                                width={200}
                            />
                        </Box>
                        <Typography textColor="GrayText">
                            Silahkan Isi Form Pendaftaran Berikut
                        </Typography>
                        <form>
                            <Box sx={{ my: 3 }}>
                                <TextField
                                    label="Nama"
                                    placeholder="john Doe"
                                    name="username"
                                    onChange={handleChange}
                                />
                                <TextField
                                    label="Email"
                                    placeholder="john@doe.com"
                                    name="email"
                                    type="email"
                                    onChange={handleChange}
                                />
                                <TextField
                                    label="Password"
                                    placeholder="*********"
                                    name="password"
                                    type="password"
                                    onChange={handleChange}
                                />
                            </Box>
                            <Button
                                variant="soft"
                                fullWidth
                                sx={{
                                    my: 1,
                                    textDecoration: "none",
                                }}
                                disabled={loading}
                                loading={loading}
                                loadingIndicator="Loading..."
                                type="submit"
                                onClick={signUp}
                            >
                                Daftar
                            </Button>
                        </form>
                    </Box>
                </Box>
            </Container>
        </>
    );
}
