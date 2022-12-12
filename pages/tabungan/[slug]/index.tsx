import {
    Box,
    Button,
    Card,
    CircularProgress,
    Grid,
    IconButton,
    Typography,
} from "@mui/joy";
import { useRouter } from "next/router";
import TabunganLayout from "../../../layout/layout";
import BackIcon from "@mui/icons-material/ArrowBackIosNew";
import { MouseEventHandler, useEffect, useState } from "react";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import { toast } from "react-toastify";
import { Skeleton } from "@mui/material";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import ArrowDropUpIcon from "@mui/icons-material/ArrowDropUp";
import AddIcon from "@mui/icons-material/Add";
import _ from "lodash";
import toRupiah from "../../../utils/numberFormat";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import moment from "moment";

interface BukuTabungan {
    id: number;
    created_at: Date;
    name: string;
    referal: string;
    value: number | null;
}

interface FlowTabungan {
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

export default function DetailTabungan() {
    const router = useRouter();
    const supabase = useSupabaseClient();
    const { slug } = router.query;
    const [tabungan, setTabungan] = useState<BukuTabungan | null>(null);
    const [flowTabungan, setFlowtabungan] = useState<FlowTabungan[]>([]);
    const [loading, setLoading] = useState<boolean>(false);

    useEffect(() => {
        if (!router.isReady) return;
        getTabungan(slug);
        getPemasukan(slug);
    }, [router.isReady]);

    async function getTabungan(id: any) {
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

    async function getPemasukan(idBukuTabungan: any) {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from("pemasukan")
                .select(`*, profiles:idProfile (*)`)
                .eq("idBukuTabungan", idBukuTabungan)
                .order("created_at", { ascending: false });
            if (error) throw error.message;
            setFlowtabungan(data);
            setLoading(false);
        } catch (error) {
            setLoading(false);
            if (typeof error == "string") toast.error(error);
        }
    }

    return (
        <div>
            <TabunganLayout loading={loading}>
                <Box sx={{ display: "flex", alignItems: "center" }}>
                    <IconButton onClick={() => router.back()}>
                        <BackIcon />
                    </IconButton>
                    <Typography level="h5" sx={{ mx: 2, width: "100%" }}>
                        {loading ? (
                            <Skeleton width="50%" variant="text" />
                        ) : (
                            tabungan?.name
                        )}
                    </Typography>
                </Box>
                <Box sx={{ my: 5 }}>
                    <Grid container spacing={2}>
                        <Grid xs={12}>
                            <Card
                                variant="outlined"
                                sx={{ flexDirection: "row", gap: 1 }}
                            >
                                <Box sx={{ width: "100%" }}>
                                    <Typography
                                        level="h5"
                                        sx={{ width: "100%" }}
                                    >
                                        {loading ? (
                                            <Skeleton
                                                width="100%"
                                                variant="text"
                                            />
                                        ) : (
                                            tabungan?.name
                                        )}
                                    </Typography>
                                    <Typography>
                                        {loading ? (
                                            <Skeleton
                                                width="50%"
                                                variant="text"
                                            />
                                        ) : (
                                            tabungan?.referal
                                        )}
                                    </Typography>
                                    <Box sx={{ mt: 2 }}>
                                        <Typography>
                                            {loading ? (
                                                <Skeleton
                                                    width="25%"
                                                    variant="text"
                                                />
                                            ) : (
                                                // tabungan?.name
                                                "Saldo : " +
                                                toRupiah(tabungan?.value)
                                            )}
                                        </Typography>
                                    </Box>
                                </Box>
                                <Box>
                                    <IconButton
                                        onClick={() => {
                                            navigator.clipboard.writeText(
                                                tabungan?.referal ?? ""
                                            );
                                            toast.success(
                                                "Kode referal berhasil disalin"
                                            );
                                        }}
                                    >
                                        <ContentCopyIcon />
                                    </IconButton>
                                </Box>
                            </Card>
                        </Grid>
                        <Grid xs={12} sm={6}>
                            <CustomCard
                                loading={loading}
                                tipe="pemasukan"
                                title="Pemasukan"
                                onDetail={() =>
                                    router.push(`${slug}/pemasukan`)
                                }
                                onAdd={() =>
                                    router.push(`${slug}/pemasukan/add`)
                                }
                                nominal={toRupiah(
                                    _.sumBy(
                                        _.filter(
                                            flowTabungan,
                                            (val) => val.tipe == true
                                        ),
                                        (p) => p?.nominal
                                    )
                                )}
                            />
                        </Grid>
                        <Grid xs={12} sm={6}>
                            <CustomCard
                                loading={loading}
                                tipe="pengeluaran"
                                title="Pengeluaran"
                                onDetail={() =>
                                    router.push(`${slug}/pengeluaran`)
                                }
                                onAdd={() =>
                                    router.push(`${slug}/pengeluaran/add`)
                                }
                                nominal={toRupiah(
                                    _.sumBy(
                                        _.filter(
                                            flowTabungan,
                                            (val) => val.tipe == false
                                        ),
                                        (p) => p?.nominal
                                    )
                                )}
                            />
                        </Grid>
                    </Grid>
                </Box>

                <Box
                    sx={{
                        my: 2,
                        display: "flex",
                        gap: 2,
                        flexDirection: "column",
                    }}
                >
                    {flowTabungan.map((flow, i) => (
                        <CustomCardAlert flow={flow} key={i} />
                    ))}
                </Box>
            </TabunganLayout>
        </div>
    );
}

interface CustomCardProps {
    title: string;
    onAdd?: MouseEventHandler<HTMLAnchorElement> | undefined;
    onDetail?: MouseEventHandler<HTMLAnchorElement> | undefined;
    tipe: "pemasukan" | "pengeluaran";
    nominal: string;
    loading: boolean;
}

function CustomCard({
    title,
    onAdd,
    onDetail,
    tipe,
    nominal,
    loading,
}: CustomCardProps) {
    return (
        <Card variant="outlined" sx={{ gap: 2 }}>
            <Box
                sx={{
                    display: "flex",
                    flexDirection: "row",
                    // justifyContent: "space-between",
                }}
            >
                <Box sx={{ width: "100%" }}>
                    <Typography level="h5">{title}</Typography>
                    <Box
                        sx={{
                            display: "flex",
                            flexDirection: "row",
                            alignItems: "center",
                            color: "green",
                        }}
                    >
                        {tipe == "pemasukan" ? (
                            <ArrowDropUpIcon />
                        ) : (
                            <ArrowDropDownIcon color="error" />
                        )}
                        <Typography
                            color={tipe == "pemasukan" ? "success" : "danger"}
                        >
                            {nominal}
                        </Typography>
                    </Box>
                </Box>
                <Box>
                    <IconButton onClick={onAdd} disabled={loading}>
                        {loading ? <CircularProgress /> : <AddIcon />}
                    </IconButton>
                </Box>
            </Box>
            <Button variant="soft" onClick={onDetail}>
                Detail
            </Button>
        </Card>
    );
}

function CustomCardAlert({ flow }: { flow: FlowTabungan }) {
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
