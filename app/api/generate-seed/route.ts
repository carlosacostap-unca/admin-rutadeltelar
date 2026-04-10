import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json(
      { error: 'La API Key de OpenAI no está configurada en el entorno (.env.local).' },
      { status: 500 }
    );
  }

  try {
    const { prompt } = await req.json();

    const systemPrompt = `Eres un asistente experto en turismo y desarrollo local. Tu tarea es generar datos sintéticos realistas para el sistema "Ruta del Telar" en formato JSON. Toda la información generada debe estar ubicada estrictamente en la provincia de Catamarca, Argentina.
    Devuelve estrictamente un JSON con la siguiente estructura y sin texto adicional:
    {
      "estaciones": [{"id_ref": "e1", "nombre": "...", "localidad": "...", "descripcion_general": "...", "mapas_referencias": "https://maps.google.com/...", "coordenadas_generales": "-27.000, -66.000"}],
      "actores": [{"id_ref": "a1", "estacion_ref": "e1", "nombre": "...", "tipo": "artesano|productor|hospedaje|gastronomico|guia", "descripcion": "...", "contacto_telefono": "+54 9 383...", "ubicacion": "..."}],
      "productos": [{"nombre": "...", "categoria": "textil|ceramica|madera|metal|cuero|gastronomia|otros", "descripcion": "...", "estacion_ref": "e1", "actores_refs": ["a1"]}],
      "experiencias": [{"titulo": "...", "categoria": "taller|recorrido|degustacion|demostracion|convivencia|otros", "descripcion": "...", "duracion": "X horas", "recomendaciones": "...", "responsable_ref": "a1", "estacion_ref": "e1", "ubicacion": "..."}],
      "imperdibles": [{"titulo": "...", "tipo": "lugar|actividad|evento|atractivo|otro", "descripcion": "...", "motivo_destaque": "...", "estacion_ref": "e1", "prioridad": "alta|media|baja", "ubicacion": "..."}]
    }
    
    Requisitos:
    - Genera al menos 2 estaciones, 3 actores por estación, 3 productos, 2 experiencias y 2 imperdibles en total.
    - Asegúrate de que las referencias cruzadas (id_ref, estacion_ref, actores_refs, responsable_ref) coincidan lógicamente entre los elementos. No referencies IDs que no hayas creado en el mismo JSON.
    ${prompt ? `- Toma en cuenta el siguiente contexto temático solicitado por el usuario: "${prompt}"` : ''}
    `;

    const completion = await openai.chat.completions.create({
      model: 'gpt-5-mini', // As requested by the user
      messages: [
        {
          role: 'system',
          content: systemPrompt,
        },
      ],
      response_format: { type: 'json_object' },
    });

    const content = completion.choices[0].message.content || '{}';
    const parsedData = JSON.parse(content);

    return NextResponse.json(parsedData);
  } catch (error: any) {
    console.error('Error generando datos con OpenAI:', error);
    return NextResponse.json(
      { error: error.message || 'Error desconocido al interactuar con OpenAI.' },
      { status: 500 }
    );
  }
}
