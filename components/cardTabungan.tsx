import { AspectRatio, Avatar, Box, Card, Typography } from "@mui/joy";
import { useRouter } from "next/router";
import { MouseEventHandler } from "react";

interface Props {
    title: string;
    value: string;
    id: string;
}

const color: string[] = [
    "primary",
    "neutral",
    "danger",
    "info",
    "success",
    "warning",
];

function generateRandomColor(name: string) {
    const index =
        name.length <= color.length
            ? name.length
            : Math.abs(name.length - color.length);
    return color[index] as
        | "primary"
        | "neutral"
        | "danger"
        | "info"
        | "success"
        | "warning"
        | undefined;
}

export default function CardTabungan({ title, value, id }: Props) {
    const router = useRouter();

    return (
        <Card
            variant="outlined"
            row
            onClick={() => router.push(`/tabungan/${id}`)}
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
                sx={{ width: 90 }}
                variant="soft"
                color={generateRandomColor(title)}
            >
                <Avatar variant="plain" color={generateRandomColor(title)}>
                    {title[0]}
                </Avatar>
            </AspectRatio>
            <Box
                sx={{
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    maxWidth: "100%",
                }}
            >
                <Typography level="h2" fontSize="md" mb={0.5}>
                    {title}
                </Typography>
                <Typography fontSize="sm" mb={1}>
                    {value}
                </Typography>
            </Box>
        </Card>
    );
}
