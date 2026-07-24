import { describe, it, expect } from "vitest"

import { parseOoc } from "@workspace/shared/lib/ooc-parser"

describe("parseOoc", () => {
  it("devuelve cleaned y segments vacios si el input esta vacio", () => {
    expect(parseOoc("")).toEqual({ cleanedContent: "", oocSegments: [] })
  })

  it("no extrae nada si no hay bloques ////", () => {
    const result = parseOoc("Hola, soy Alice.")
    expect(result.cleanedContent).toBe("Hola, soy Alice.")
    expect(result.oocSegments).toEqual([])
  })

  it("extrae un OOC al final del texto", () => {
    const result = parseOoc("*Salgo de mi habitacion.* //Crea memorias//")
    expect(result.cleanedContent).toBe("*Salgo de mi habitacion.*")
    expect(result.oocSegments).toEqual(["Crea memorias"])
  })

  it("extrae un OOC al medio del texto", () => {
    const result = parseOoc(
      "Narracion //meta// mas narracion",
    )
    expect(result.cleanedContent).toBe("Narracion mas narracion")
    expect(result.oocSegments).toEqual(["meta"])
  })

  it("extrae multiples OOC en orden", () => {
    const result = parseOoc("//primero// texto //segundo//")
    expect(result.cleanedContent).toBe("texto")
    expect(result.oocSegments).toEqual(["primero", "segundo"])
  })

  it("descarta // sin cerrar y lo trata como texto literal", () => {
    const result = parseOoc("Hola //sin cerrar mundo")
    expect(result.cleanedContent).toBe("Hola //sin cerrar mundo")
    expect(result.oocSegments).toEqual([])
  })

  it("descarta OOC vacio ////", () => {
    const result = parseOoc("texto //// mas texto")
    expect(result.cleanedContent).toBe("texto mas texto")
    expect(result.oocSegments).toEqual([])
  })

  it("hace trim interno de cada OOC", () => {
    const result = parseOoc("//  hola mundo  //")
    expect(result.oocSegments).toEqual(["hola mundo"])
  })

  it("preserva saltos de linea entre roleplay", () => {
    const result = parseOoc("Linea 1\nLinea 2 //ooc//\nLinea 3")
    expect(result.cleanedContent).toBe("Linea 1\nLinea 2\nLinea 3")
    expect(result.oocSegments).toEqual(["ooc"])
  })

  it("no captura saltos de linea dentro de un OOC (single-line)", () => {
    const result = parseOoc("texto //ooc con\nsalto// mas texto")
    expect(result.cleanedContent).toBe("texto //ooc con\nsalto// mas texto")
    expect(result.oocSegments).toEqual([])
  })

  it("preserva acciones *foo* intactas al extraer OOC", () => {
    const result = parseOoc("*Salgo.* //Crea memorias//")
    expect(result.cleanedContent).toBe("*Salgo.*")
    expect(result.oocSegments).toEqual(["Crea memorias"])
  })

  it("extrae OOC con caracteres especiales", () => {
    const result = parseOoc("//Recuerdame: nivel 5, hp 100, dagas x2//")
    expect(result.oocSegments).toEqual(["Recuerdame: nivel 5, hp 100, dagas x2"])
  })

  it("colapsa multiples saltos de linea consecutivos tras extraer OOC", () => {
    const result = parseOoc("A\n\n\n//ooc//\n\n\nB")
    expect(result.cleanedContent).toBe("A\n\nB")
    expect(result.oocSegments).toEqual(["ooc"])
  })

  it("limpia espacios al final de lineas seguidas del OOC", () => {
    const result = parseOoc("Hola.   \n//ooc//\nMundo.")
    expect(result.cleanedContent).toBe("Hola.\n\nMundo.")
    expect(result.oocSegments).toEqual(["ooc"])
  })

  it("soporta tres o mas OOC en linea", () => {
    const result = parseOoc("//a// //b// //c//")
    expect(result.cleanedContent).toBe("")
    expect(result.oocSegments).toEqual(["a", "b", "c"])
  })
})
