import { Box, Button, TextField, Typography, Container } from "@mui/joy";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import Head from "next/head";
import Image from "next/image";
import { useRouter } from "next/router";
import { ChangeEvent, useEffect, useState } from "react";
import { toast } from "react-toastify";
import docLogo from "/public/doc.svg";

interface UserLogin {
    email: string;
    password: string;
}

export default function Login() {
    const supabase = useSupabaseClient();
    const router = useRouter();

    const [loading, setLoading] = useState<boolean>(false);

    const [user, setUser] = useState<UserLogin>({ email: "", password: "" });

    async function login(): Promise<void> {
        const { email, password } = user;
        try {
            setLoading(true);
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });
            if (error) throw error.message;
            setLoading(false);
            toast.success(
                `Selamat Datang ${
                    data.user?.user_metadata?.username ?? "User Tabunganku"
                }`
            );
            router.replace("/");
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
                <title>Tabunganku | Login</title>
            </Head>
            <Container maxWidth="sm" sx={{ minHeight: "100vh" }}>
                <Box
                    sx={{
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        minHeight: "100vh",
                        my: 2,
                    }}
                >
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
                            Silahkan Masuk ke Akun Anda
                        </Typography>
                        <form>
                            <Box sx={{ my: 3 }}>
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
                                variant="solid"
                                fullWidth
                                sx={{ my: 1 }}
                                onClick={login}
                                disabled={loading}
                                loading={loading}
                                loadingIndicator="Loading..."
                                type="submit"
                            >
                                Masuk
                            </Button>
                        </form>
                        <Button
                            variant="soft"
                            fullWidth
                            sx={{
                                my: 1,
                                textDecoration: "none",
                            }}
                            disabled={loading}
                            onClick={() =>
                                router.push({
                                    pathname: "/auth/register",
                                    query: { from: "/auth/login" },
                                })
                            }
                        >
                            Daftar
                        </Button>
                    </Box>
                </Box>
            </Container>
        </>
    );
}
