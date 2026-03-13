import { NextResponse } from 'next/server';

import { getOpenClawWorkspaceModel, mutateOpenClawBoard } from '@/lib/server/openclaw';
import { OpenClawBoardMutation } from '@/lib/types';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const model = await getOpenClawWorkspaceModel();

    return NextResponse.json({
      board: model.board,
      assignmentOptions: model.assignmentOptions,
    });
  } catch {
    return NextResponse.json(
      { message: 'Unable to read the live task board.' },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const mutation = (await request.json()) as OpenClawBoardMutation;
    const board = await mutateOpenClawBoard(mutation);

    return NextResponse.json({ board });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to update the live task board.';
    return NextResponse.json({ message }, { status: 400 });
  }
}