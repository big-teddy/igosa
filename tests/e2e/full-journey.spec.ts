import { test, expect } from '@playwright/test';

test.describe('Full User Journey', () => {
    test('Complete negotiation flow from start to payment', async ({ page }) => {
        // Mock Negotiation Trigger API
        await page.route('**/api/negotiations/trigger', async route => {
            const json = {
                success: true,
                negotiationId: 'mock-negotiation-id',
                data: {
                    negotiationId: 'mock-negotiation-id',
                    status: 'in_progress',
                    participants: 1,
                    proposedPrice: 140000,
                    estimatedSuccess: 0.85
                }
            };
            await route.fulfill({ json });
        });

        // Mock Negotiation Details API
        await page.route('/api/negotiations/mock-negotiation-id', async route => {
            const json = {
                success: true,
                negotiation: {
                    id: 'mock-negotiation-id',
                    productId: 'nike-pegasus-40',
                    status: 'in_progress',
                    targetPrice: 149000,
                    aiProposedPrice: 140000,
                    avgTargetPrice: 145000,
                    totalParticipants: 1,
                    aiConfidenceScore: 0.85,
                    createdAt: new Date().toISOString(),
                    aiReasoning: {
                        demandAnalysis: 'High demand',
                        priceOptimization: 'Optimal price found',
                        recommendation: 'Buy now'
                    }
                },
                timeline: []
            };
            await route.fulfill({ json });
        });

        // Block WebSocket connections to prevent Supabase Realtime hangs
        await page.route('wss://**', route => route.abort());

        // Enable console logging
        page.on('console', msg => {
            const text = `[Browser Console] ${msg.type()}: ${msg.text()}\n`;
            console.log(text);
            require('fs').appendFileSync('console.log', text);
        });

        // 1. Start Negotiation
        await page.goto('/');

        // Wait for search input and type query
        const searchInput = page.getByPlaceholder(/최저가를 찾고 계신가요|어떤 제품이 필요하신가요/);
        await searchInput.waitFor();
        await searchInput.fill('무선 이어폰');
        await page.waitForTimeout(500); // Wait for state update

        // Click search button
        const searchButton = page.locator('button[type="submit"]');
        await searchButton.click();
        console.log('Clicked search button');

        // Wait for search results
        // Check for either product cards or error message
        try {
            // Verify debug toasts to diagnose
            await expect(page.getByText(/Debug: Keyword=이어폰/)).toBeVisible({ timeout: 10000 });
            await expect(page.getByText(/Debug: Products=3/)).toBeVisible({ timeout: 10000 });

            // Verify product is visible first (relax match)
            const productCard = page.getByText(/에어팟/);
            if (await productCard.count() === 0) {
                console.log('Product card not found. Dumping page content...');
                const content = await page.content();
                require('fs').writeFileSync('page-content.html', content);
            }
            await expect(productCard.first()).toBeVisible({ timeout: 10000 });

            // Look for the "Start Negotiation" button we added
            const startButton = page.getByRole('button', { name: /AI 네고 시작하기/i }).first();
            await startButton.waitFor({ timeout: 10000 });
            console.log('Found start button, clicking...');
            await startButton.click();
            console.log('Button clicked, waiting for toast...');

            // Verify success toast
            await expect(page.getByText('AI 협상을 시작합니다!')).toBeVisible({ timeout: 5000 });
            require('fs').appendFileSync('console.log', 'Success toast found!\n');
        } catch (e) {
            // If failed, check for error message
            const errorMsg = page.getByText(/오류가 발생했습니다|문제가 발생했습니다|협상을 시작할 수 없습니다/);
            if (await errorMsg.isVisible()) {
                const text = await errorMsg.textContent();
                console.log('Error toast text:', text);
                require('fs').appendFileSync('console.log', `Error toast found: ${text}\n`);
                throw new Error(`Search/Negotiation failed with error message: ${text}`);
            }
            throw e;
        }

        // Wait for negotiation page to load
        await expect(page).toHaveURL(/\/negotiations\/.+/, { timeout: 15000 });

        // 2. Verify Negotiation UI
        await expect(page.getByText(/협상 상세/)).toBeVisible();

        // 3. Verify Timeline Component
        await expect(page.getByText('타임라인')).toBeVisible();

        // 4. Verify Participant Count
        await expect(page.getByText(/명 참여 중/)).toBeVisible();
    });
});
