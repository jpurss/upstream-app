'use client'

import ReactDiffViewer from 'react-diff-viewer-continued'

const darkStyles = {
  variables: {
    dark: {
      diffViewerBackground: '#09090b', // --background zinc-950
      diffViewerColor: 'oklch(0.985 0 0)', // --foreground
      addedBackground: '#14532d26', // subtle teal tint
      addedColor: '#65CFB2', // --success
      removedBackground: '#7f1d1d26', // subtle red tint
      removedColor: '#E3392A', // --destructive
      wordAddedBackground: '#14532d4d',
      wordRemovedBackground: '#7f1d1d4d',
      gutterBackground: '#18181b', // --card zinc-900
      gutterColor: '#71717a', // --muted-foreground
    },
  },
}

interface DiffViewerProps {
  original: string
  adapted: string
  leftTitle?: string
  rightTitle?: string
}

export function DiffViewer({ original, adapted, leftTitle = 'Original', rightTitle = 'Adapted' }: DiffViewerProps) {
  if (original === adapted) {
    return (
      <div className="flex items-center justify-center py-12 text-[13px] text-muted-foreground">
        No differences found.
      </div>
    )
  }
  return (
    <ReactDiffViewer
      oldValue={original}
      newValue={adapted}
      splitView={true}
      useDarkTheme={true}
      styles={darkStyles}
      leftTitle={leftTitle}
      rightTitle={rightTitle}
      hideLineNumbers={false}
      showDiffOnly={false}
    />
  )
}
