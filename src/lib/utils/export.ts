/**
 * 데이터 내보내기 유틸리티
 */

interface ExportOptions {
    filename: string;
    type: 'json' | 'csv' | 'xlsx';
}

/**
 * JSON 파일로 내보내기
 */
export function exportToJSON<T>(data: T, filename: string): void {
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    downloadBlob(blob, `${filename}.json`);
}

/**
 * CSV 파일로 내보내기
 */
export function exportToCSV<T extends Record<string, unknown>>(
    data: T[],
    filename: string,
    headers?: string[]
): void {
    if (data.length === 0) return;

    const keys = headers || Object.keys(data[0]);
    const headerRow = keys.join(',');

    const rows = data.map((item) =>
        keys
            .map((key) => {
                const value = item[key];
                // Handle strings with commas or quotes
                if (typeof value === 'string') {
                    if (value.includes(',') || value.includes('"') || value.includes('\n')) {
                        return `"${value.replace(/"/g, '""')}"`;
                    }
                    return value;
                }
                return String(value ?? '');
            })
            .join(',')
    );

    const csv = [headerRow, ...rows].join('\n');
    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8' });
    downloadBlob(blob, `${filename}.csv`);
}

/**
 * Blob 다운로드 헬퍼
 */
function downloadBlob(blob: Blob, filename: string): void {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

/**
 * 클립보드에 텍스트 복사
 */
export async function copyToClipboard(text: string): Promise<boolean> {
    try {
        await navigator.clipboard.writeText(text);
        return true;
    } catch {
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.left = '-9999px';
        document.body.appendChild(textArea);
        textArea.select();

        try {
            document.execCommand('copy');
            return true;
        } catch {
            return false;
        } finally {
            document.body.removeChild(textArea);
        }
    }
}

/**
 * 공유 URL 생성
 */
export function createShareUrl(path: string, params?: Record<string, string>): string {
    const baseUrl = typeof window !== 'undefined'
        ? window.location.origin
        : process.env.NEXT_PUBLIC_APP_URL || 'https://igosa.vercel.app';

    const url = new URL(path, baseUrl);

    if (params) {
        Object.entries(params).forEach(([key, value]) => {
            url.searchParams.set(key, value);
        });
    }

    return url.toString();
}

/**
 * 데이터 테이블 인쇄
 */
export function printData<T extends Record<string, unknown>>(
    data: T[],
    title: string,
    columns: { key: keyof T; label: string }[]
): void {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>${title}</title>
        <style>
          body { font-family: system-ui, sans-serif; padding: 20px; }
          h1 { font-size: 18px; margin-bottom: 20px; }
          table { width: 100%; border-collapse: collapse; }
          th, td { padding: 8px; text-align: left; border-bottom: 1px solid #ddd; }
          th { background: #f5f5f5; font-weight: 600; }
          @media print { button { display: none; } }
        </style>
      </head>
      <body>
        <h1>${title}</h1>
        <table>
          <thead>
            <tr>
              ${columns.map((col) => `<th>${col.label}</th>`).join('')}
            </tr>
          </thead>
          <tbody>
            ${data
            .map(
                (row) =>
                    `<tr>${columns
                        .map((col) => `<td>${String(row[col.key] ?? '')}</td>`)
                        .join('')}</tr>`
            )
            .join('')}
          </tbody>
        </table>
        <button onclick="window.print()">인쇄</button>
      </body>
    </html>
  `;

    printWindow.document.write(html);
    printWindow.document.close();
}
