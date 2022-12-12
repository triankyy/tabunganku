import { Box, IconButton, TextField, Typography, Button } from "@mui/joy";
import TabunganLayout from "../../layout/layout";
import BackIcon from "@mui/icons-material/ArrowBackIosNew";
import { useRouter } from "next/router";
import ContentPasteIcon from "@mui/icons-material/ContentPaste";
import { useState } from "react";
import { toast } from "react-toastify";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import _ from "lodash";

export default function JoinTabungan() {
    const router = useRouter();
    const supabase = useSupabaseClient();

    const [referal, setReferal] = useState<string>("");
    const [loading, setLoading] = useState<boolean>(false);

    async function handleJoin() {
        try {
            setLoading(true);
            const {
                data: { session },
                error: authError,
            } = await supabase.auth.getSession();
            if (session) {
                const { data: tabungan } = await supabase
                    .from("userTabungan")
                    .select("*, bukuTabungan:idBukuTabungan (*)")
                    .eq("idProfile", session.user.id);
                const exist = _.filter(
                    tabungan,
                    (t) => t.bukuTabungan.referal == referal
                );
                if (exist.length != 0) {
                    toast.error("Tabungan sudah tersedia di akun anda");
                    setLoading(false);
                    return;
                } else {
                    const { data, error: errorTabungan } = await supabase
                        .from("bukuTabungan")
                        .select("id")
                        .eq("referal", referal)
                        .limit(1)
                        .single();
                    if (errorTabungan) throw errorTabungan.message;
                    const { error: errorInsert } = await supabase
                        .from("userTabungan")
                        .insert({
                            idProfile: session.user.id,
                            idBukuTabungan: data.id,
                        });
                    if (errorInsert) throw errorInsert.message;
                    setLoading(false);
                    toast.success("Kode referal berhasil dimasukkan");
                    router.back();
                }
            }
            if (authError) {
                setLoading(false);
                toast.error(authError.message);
            }
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
                <Typography level="h5" sx={{ mx: 2 }}>
                    Join Tabungan
                </Typography>
            </Box>
            <Box sx={{ my: 5 }}>
                <TextField
                    required
                    label="Kode Referal"
                    placeholder="Masukkan kode referal tabungan"
                    value={referal}
                    onChange={(evt) => setReferal(evt.target.value)}
                    endDecorator={
                        <IconButton
                            onClick={() => {
                                navigator.clipboard
                                    .readText()
                                    .then((cp) => setReferal(cp));
                            }}
                        >
                            <ContentPasteIcon />
                        </IconButton>
                    }
                />
                <Box sx={{ my: 3 }}>
                    <Button
                        fullWidth
                        onClick={handleJoin}
                        loading={loading}
                        loadingIndicator="Loading..."
                    >
                        Join
                    </Button>
                </Box>
            </Box>
        </TabunganLayout>
    );
}
