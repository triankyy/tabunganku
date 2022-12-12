import { AspectRatio, Avatar, Box, Card, Typography } from "@mui/joy";
import { Skeleton } from "@mui/material";

export default function CardTabunganLoading() {
    return (
        <Card
            variant="outlined"
            row
            sx={{
                width: "100%",
                gap: 2,
                cursor: "pointer",
                "&:hover": {
                    boxShadow: "sm",
                    borderColor: "neutral.outlinedHoverBorder",
                },
            }}
        >
            <AspectRatio
                ratio="1"
                sx={{ width: 90, bgcolor: "transparent" }}
                variant="soft"
            ></AspectRatio>
            <Box
                sx={{
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    width: "100%",
                }}
            >
                <Typography level="h2" fontSize="md" mb={0.5}>
                    <Skeleton width="100%" />
                </Typography>
                <Typography fontSize="sm" mb={1}>
                    <Skeleton width="50%" />
                </Typography>
            </Box>
        </Card>
    );
}
