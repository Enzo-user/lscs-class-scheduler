// Registers jest-dom matchers (toBeInTheDocument, toHaveTextContent, ...) on
// vitest's `expect` for every test file. Referenced from vite.config.ts.
import '@testing-library/jest-dom/vitest'
import { cleanup } from '@testing-library/react'
import { afterEach } from 'vitest'

// Testing Library only unmounts automatically when test globals are enabled;
// this project keeps `globals: false`, so unmount between tests here instead.
afterEach(cleanup)
