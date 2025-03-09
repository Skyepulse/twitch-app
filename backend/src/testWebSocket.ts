import express, { Request, Response } from 'express';
const app = express();
const PORT = 5000;

app.get('/api/test', (_req: Request, res: Response) => {
    res.json({ message: "Reverse proxy works!" });
});

app.listen(PORT, () => {
    console.log(`Backend running on http://localhost:${PORT}`);
});
