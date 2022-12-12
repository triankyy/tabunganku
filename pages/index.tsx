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
} from "@mui/joy";
import Skeleton from "@mui/material/Skeleton";
import AddIcon from "@mui/icons-material/Add";
import TabunganLayout from "../layout/layout";
import { toast } from "react-toastify";
import CardTabungan from "../components/cardTabungan";
import CardTabunganLoading from "../components/cardTabunganLoading";
import toRupiah from "../utils/numberFormat";

export default function Index() {
    const supabase = useSupabaseClient();
    const router = useRouter();

    const [session, setSession] = useState<Session | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [scrolled, setScrolled] = useState<boolean>(false);

    const [tabungan, setTabungan] = useState<Array<any> | null>([]);

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
                getBukuTabungan(session.user.id);
            } else throw null;
        } catch (error) {
            router.push("/auth/login");
        }
    }

    async function getBukuTabungan(userId: string) {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from("userTabungan")
                .select("*, bukuTabungan:idBukuTabungan (*)")
                .order("created_at", { ascending: false })
                .eq("idProfile", userId);
            if (error) throw error.message;
            setTabungan(data);
            setLoading(false);
        } catch (error) {
            setLoading(false);
            if (typeof error == "string") toast.error(error);
        }
    }

    function handleScroll(): void {
        if (window.scrollY >= 20) {
            setScrolled(true);
        } else {
            setScrolled(false);
        }
    }

    if (session == null) {
        return <></>;
    } else
        return (
            <>
                <TabunganLayout loading={loading}>
                    <Grid container spacing={2}>
                        {loading
                            ? Array.from({ length: 5 }).map((_, i) => (
                                  <Grid xs={12} sm={6} key={i}>
                                      <CardTabunganLoading />
                                  </Grid>
                              ))
                            : tabungan?.map((_, i) => (
                                  <Grid xs={12} sm={6} key={i}>
                                      <CardTabungan
                                          title={_.bukuTabungan.name}
                                          value={toRupiah(_.bukuTabungan.value)}
                                          id={_.bukuTabungan.id}
                                      />
                                  </Grid>
                              ))}
                        <Grid xs={12} sm={6}>
                            <div
                                style={{ height: "100%" }}
                                onClick={() =>
                                    loading
                                        ? false
                                        : router.push("/tabungan/add")
                                }
                            >
                                <Card
                                    variant="outlined"
                                    row
                                    sx={{
                                        width: "100%",
                                        height: "100%",
                                        justifyContent: "center",
                                        cursor: "pointer",
                                        "&:hover": {
                                            boxShadow: "sm",
                                            borderColor:
                                                "neutral.outlinedHoverBorder",
                                        },
                                    }}
                                >
                                    <Box
                                        sx={{
                                            display: "flex",
                                            justifyContent: "center",
                                            alignItems: "center",
                                        }}
                                    >
                                        <AddIcon />
                                        <Typography>Tambah Tabungan</Typography>
                                    </Box>
                                </Card>
                            </div>
                        </Grid>
                    </Grid>
                </TabunganLayout>
            </>
        );
}
