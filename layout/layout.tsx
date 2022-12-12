import { useEffect, useState } from "react";
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
    LinearProgress,
} from "@mui/joy";
import { alpha } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";

interface Props {
    children: any;
    loading?: boolean;
}

export default function TabunganLayout({ children, loading }: Props) {
    const supabase = useSupabaseClient();
    const router = useRouter();

    const [session, setSession] = useState<Session | null>(null);
    const [scrolled, setScrolled] = useState<boolean>(false);

    useEffect(() => {
        getUserSession();
        supabase.auth.onAuthStateChange((_event, session) => {
            if (!session) {
                router.push("/auth/login");
            }
        });
        window.addEventListener("scroll", handleScroll);
    }, []);

    async function getUserSession(): Promise<void> {
        try {
            const {
                data: { session },
            } = await supabase.auth.getSession();
            if (!session) {
                router.push("/auth/login");
            }
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

    return (
        <>
            {/* <Box sx={{ position: "fixed", width: "100%" }}></Box> */}
            <Box
                sx={{
                    bgcolor: alpha("#fff", 0.5),
                    position: "fixed",
                    width: "100%",
                    backdropFilter: "blur(10px)",
                    borderBottom: scrolled ? `1px solid lightGrey` : "none",
                    // py: 2,
                    zIndex: 999,
                }}
            >
                {loading ? <LinearProgress size="sm" /> : <></>}
                <Container
                    maxWidth="sm"
                    sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        py: 2,
                    }}
                >
                    <Typography
                        level="h6"
                        sx={(theme) => ({
                            color: theme.vars.palette.primary[500],
                            cursor: "pointer",
                        })}
                        onClick={() => router.replace("/")}
                    >
                        Tabunganku
                    </Typography>
                    <Box>
                        <Button
                            variant="outlined"
                            sx={{ ml: 1 }}
                            onClick={() => router.push("/tabungan/join")}
                        >
                            Join Tabungan
                        </Button>
                        <Button
                            variant="outlined"
                            sx={{ ml: 1 }}
                            onClick={() => router.push("/tabungan/add")}
                        >
                            +
                        </Button>
                    </Box>
                </Container>
            </Box>
            <Container
                maxWidth="sm"
                sx={{ minHeight: "100vh", pt: { xs: 10, sm: 15 } }}
            >
                {children}
            </Container>
        </>
    );
}
