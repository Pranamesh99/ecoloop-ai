import { render, screen } from '@testing-library/react'
import DataJournal from '@/components/DataJournal'
import EnergyPieChart from '@/components/EnergyPieChart'

// Mock fetch
global.fetch = jest.fn(() =>
  Promise.resolve({
    json: () => Promise.resolve([{ agent: 'TestAgent', action: 'TestAction', reasoning: 'Because', timestamp: '2026-07-26T12:00:00Z' }]),
  })
) as jest.Mock

describe('DataJournal Component', () => {
  it('renders correctly and fetches logs', async () => {
    render(<DataJournal />)
    expect(screen.getByText('Audit Trail / Data Journal')).toBeInTheDocument()
    expect(await screen.findByText('TestAgent')).toBeInTheDocument()
    expect(screen.getByText('Because')).toBeInTheDocument()
  })
})

describe('EnergyPieChart Component', () => {
  it('renders without crashing on mock telemetry', () => {
    const mockTelemetry = { chiller_load_kw: 25.0 };
    // ResizeObserver is needed for Recharts, mock it
    global.ResizeObserver = class {
      observe() {}
      unobserve() {}
      disconnect() {}
    };
    
    render(<EnergyPieChart telemetry={mockTelemetry} />);
    expect(screen.getByText('Live Energy Breakdown')).toBeInTheDocument();
  })
})
