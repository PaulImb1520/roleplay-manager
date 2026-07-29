import { describe, it, expect, vi, afterEach, beforeEach } from "vitest"
import { render, screen, cleanup, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"

import { InstanceManager } from "./instance-manager"
import * as api from "@/lib/api/provider-instances"
import type { ProviderInstance } from "@workspace/shared/types/provider-instance"

vi.mock("@/lib/api/provider-instances", () => ({
  createProviderInstance: vi.fn(),
  updateProviderInstance: vi.fn(),
  deleteProviderInstance: vi.fn(),
}))

const mockInstances: ProviderInstance[] = [
  { id: "1", name: "Local", kind: "openai-compatible", url: "http://localhost:1234/v1", apiKey: null, createdAt: "2024-01-01T00:00:00Z", updatedAt: "2024-01-01T00:00:00Z" },
]

afterEach(() => {
  cleanup()
  document.body.querySelectorAll("[data-base-ui-portal]").forEach(el => el.remove())
  document.body.querySelectorAll("[data-base-ui-inert]").forEach(el => el.remove())
  document.body.style.overflowY = ""
  document.body.style.overflowX = ""
})

describe("InstanceManager", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("calls createProviderInstance with typed values on first click", async () => {
    const mockedCreate = vi.mocked(api.createProviderInstance)
    mockedCreate.mockResolvedValue(mockInstances[0])

    const onInstancesChange = vi.fn()
    const onSelect = vi.fn()
    const user = userEvent.setup()

    render(
      <InstanceManager
        instances={mockInstances}
        loading={false}
        selectedInstanceId={null}
        onSelect={onSelect}
        onInstancesChange={onInstancesChange}
      />,
    )

    await user.click(screen.getByText("Nueva instancia"))

    const nameInput = await screen.findByLabelText("Nombre")
    const urlInput = screen.getByLabelText("URL base")

    await user.type(nameInput, "Ollama")
    await user.type(urlInput, "http://ollama:11434/v1")

    await user.click(screen.getByText("Crear instancia"))

    await waitFor(() => {
      expect(mockedCreate).toHaveBeenCalledTimes(1)
    })

    const callArg = mockedCreate.mock.calls[0][0]
    console.log("[diag-manager] createProviderInstance called with:", JSON.stringify(callArg))

    expect(callArg.name).toBe("Ollama")
    expect(callArg.url).toBe("http://ollama:11434/v1")
    expect(callArg.kind).toBe("openai-compatible")
  })

  it("first call fails (server error), second call still sends correct values", async () => {
    const mockedCreate = vi.mocked(api.createProviderInstance)
    // First call fails (simulates server validation error)
    mockedCreate.mockRejectedValueOnce(new Error("Name is required"))
    // Second call succeeds
    mockedCreate.mockResolvedValueOnce(mockInstances[0])

    const onInstancesChange = vi.fn()
    const onSelect = vi.fn()
    const user = userEvent.setup()

    render(
      <InstanceManager
        instances={mockInstances}
        loading={false}
        selectedInstanceId={null}
        onSelect={onSelect}
        onInstancesChange={onInstancesChange}
      />,
    )

    await user.click(screen.getByText("Nueva instancia"))

    const nameInput = await screen.findByLabelText("Nombre") as HTMLInputElement
    const urlInput = screen.getByLabelText("URL base") as HTMLInputElement

    await user.type(nameInput, "Ollama")
    await user.type(urlInput, "http://ollama:11434/v1")

    expect(nameInput).toHaveValue("Ollama")
    expect(urlInput).toHaveValue("http://ollama:11434/v1")

    // First click — should fail (mock rejects)
    await user.click(screen.getByText("Crear instancia"))
    await waitFor(() => {
      expect(mockedCreate).toHaveBeenCalledTimes(1)
    })

    const firstCallArg = mockedCreate.mock.calls[0][0]
    console.log("[diag-manager-retry-1st] DOM name:", nameInput.value)
    console.log("[diag-manager-retry-1st] API name:", firstCallArg.name, "| URL:", firstCallArg.url)

    // Dialog should still be open after failure
    // Second click — should succeed
    await user.click(screen.getByText("Crear instancia"))
    await waitFor(() => {
      expect(mockedCreate).toHaveBeenCalledTimes(2)
    })

    const secondCallArg = mockedCreate.mock.calls[1][0]
    console.log("[diag-manager-retry-2nd] DOM name:", nameInput.value)
    console.log("[diag-manager-retry-2nd] API name:", secondCallArg.name, "| URL:", secondCallArg.url)

    // Both calls should have identical correct values
    expect(firstCallArg.name).toBe("Ollama")
    expect(firstCallArg.url).toBe("http://ollama:11434/v1")
    expect(secondCallArg.name).toBe("Ollama")
    expect(secondCallArg.url).toBe("http://ollama:11434/v1")
  })
})
