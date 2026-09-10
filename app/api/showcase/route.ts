import { NextResponse } from "next/server";

export async function GET() {
    const jftStudents = [
        { id: 1, name: "Budi Santoso", nameJp: "ブディ・サントソ", avatar: "https://api.dicebear.com/7.x/adventurer/svg?seed=jft1", category: "Lulus JFT-Basic", skills: ["JFT-Basic", "日本語N4レベル"] },
        { id: 2, name: "Rina Wijaya", nameJp: "リナ・ウィジャヤ", avatar: "https://api.dicebear.com/7.x/adventurer/svg?seed=jft2", category: "Lulus JFT-Basic", skills: ["JFT-Basic", "介護"] },
        { id: 3, name: "Dedi Kusuma", nameJp: "デディ・クスマ", avatar: "https://api.dicebear.com/7.x/adventurer/svg?seed=jft3", category: "Lulus JFT-Basic", skills: ["JFT-Basic", "食品製造"] },
        { id: 4, name: "Sari Pratiwi", nameJp: "サリ・プラティウィ", avatar: "https://api.dicebear.com/7.x/adventurer/svg?seed=jft4", category: "Lulus JFT-Basic", skills: ["JFT-Basic", "農業"] },
        { id: 5, name: "Andi Susanto", nameJp: "アンディ・スサント", avatar: "https://api.dicebear.com/7.x/adventurer/svg?seed=jft5", category: "Lulus JFT-Basic", skills: ["JFT-Basic", "製造業"] },
    ];

    const n5Students = [
        { id: 6, name: "Wahyu Setiawan", nameJp: "ワユ・セティアワン", avatar: "https://api.dicebear.com/7.x/adventurer/svg?seed=n51", category: "Lulus N5", skills: ["JLPT N5", "介護"] },
        { id: 7, name: "Lestari Dewi", nameJp: "レスタリ・デウィ", avatar: "https://api.dicebear.com/7.x/adventurer/svg?seed=n52", category: "Lulus N5", skills: ["JLPT N5", "外食業"] },
        { id: 8, name: "Hendra Putra", nameJp: "ヘンドラ・プトラ", avatar: "https://api.dicebear.com/7.x/adventurer/svg?seed=n53", category: "Lulus N5", skills: ["JLPT N5", "製造業"] },
        { id: 9, name: "Yuni Rahayu", nameJp: "ユニ・ラハユ", avatar: "https://api.dicebear.com/7.x/adventurer/svg?seed=n54", category: "Lulus N5", skills: ["JLPT N5", "農業"] },
        { id: 10, name: "Fajar Hidayat", nameJp: "ファジャル・ヒダヤット", avatar: "https://api.dicebear.com/7.x/adventurer/svg?seed=n55", category: "Lulus N5", skills: ["JLPT N5", "建設業"] },
    ];

    const bab15Students = [
        { id: 11, name: "Agus Wibowo", nameJp: "アグス・ウィボウォ", avatar: "https://api.dicebear.com/7.x/adventurer/svg?seed=bab1", category: "Baru 15 Bab", skills: ["みんなの日本語第15課", "ひらがな", "カタカナ"] },
        { id: 12, name: "Ratna Sari", nameJp: "ラトナ・サリ", avatar: "https://api.dicebear.com/7.x/adventurer/svg?seed=bab2", category: "Baru 15 Bab", skills: ["みんなの日本語第15課", "ひらがな", "介護"] },
        { id: 13, name: "Rizal Fauzi", nameJp: "リザル・ファウジ", avatar: "https://api.dicebear.com/7.x/adventurer/svg?seed=bab3", category: "Baru 15 Bab", skills: ["みんなの日本語第15課", "ひらがな", "製造業"] },
        { id: 14, name: "Dewi Susanti", nameJp: "デウィ・ススアンティ", avatar: "https://api.dicebear.com/7.x/adventurer/svg?seed=bab4", category: "Baru 15 Bab", skills: ["みんなの日本語第15課", "ひらがな", "農業"] },
        { id: 15, name: "Tono Waskito", nameJp: "トノ・ワスキト", avatar: "https://api.dicebear.com/7.x/adventurer/svg?seed=bab5", category: "Baru 15 Bab", skills: ["みんなの日本語第15課", "ひらがな", "食品製造"] },
    ];

    return NextResponse.json({
        success: true,
        data: [...jftStudents, ...n5Students, ...bab15Students],
    });
}