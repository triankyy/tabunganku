export default function toRupiah(number: number | null | undefined) {
    return new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
    }).format(number ?? 0);
}