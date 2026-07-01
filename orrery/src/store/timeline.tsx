import { createContext, useContext, useReducer, type Dispatch, type ReactNode } from 'react'
import { calculateRatioFromGranularity, type Granularity, type TimelineSettings } from '#/utils/time'

export type PlayState = 'play' | 'pause'
export type TimelineSpeed = 'REAL_TIME' | 'ONE_SECOND'

export type TimelineState = {
  time: number
  playing: PlayState
  timelineSpeed: TimelineSpeed
  granularity: Granularity
  timelineSettings: TimelineSettings
}

type Action =
  | { type: 'UPDATE_TIME'; payload: number }
  | { type: 'UPDATE_TIMELINE_SPEED'; payload: TimelineSpeed }
  | { type: 'UPDATE_GRANULARITY'; payload: Granularity }
  | { type: 'PLAY_TIME' }
  | { type: 'PAUSE_TIME' }
  | { type: 'INTERVAL_TIME' }

function createInitialState(settings: TimelineSettings, granularity: Granularity = 'year'): TimelineState {
  return {
    time: 0,
    playing: 'pause',
    timelineSpeed: 'REAL_TIME',
    granularity,
    timelineSettings: settings,
  }
}

function timelineReducer(state: TimelineState, action: Action): TimelineState {
  switch (action.type) {
    case 'UPDATE_TIME':
      return { ...state, time: action.payload }
    case 'UPDATE_TIMELINE_SPEED':
      return { ...state, timelineSpeed: action.payload }
    case 'UPDATE_GRANULARITY':
      return { ...state, granularity: action.payload }
    case 'PLAY_TIME':
      return { ...state, playing: 'play' }
    case 'PAUSE_TIME':
      return { ...state, playing: 'pause' }
    case 'INTERVAL_TIME': {
      const increment = calculateRatioFromGranularity(state.granularity, state.timelineSettings)
      const next = state.time + increment
      return next > 1
        ? { ...state, time: 1, playing: 'pause' }
        : { ...state, time: next }
    }
    default:
      return state
  }
}

const StateContext = createContext<TimelineState | null>(null)
const DispatchContext = createContext<Dispatch<Action> | null>(null)

export function TimelineProvider({
  children,
  settings,
  defaultGranularity = 'year',
}: {
  children: ReactNode
  settings: TimelineSettings,
  defaultGranularity?: Granularity
}) {
  const [state, dispatch] = useReducer(timelineReducer, createInitialState(settings, defaultGranularity))
  return (
    <StateContext.Provider value={state}>
      <DispatchContext.Provider value={dispatch}>
        {children}
      </DispatchContext.Provider>
    </StateContext.Provider>
  )
}

export function useTimelineState(): TimelineState {
  const ctx = useContext(StateContext)
  if (!ctx) throw new Error('useTimelineState must be used inside TimelineProvider')
  return ctx
}

export function useTimelineDispatch(): Dispatch<Action> {
  const ctx = useContext(DispatchContext)
  if (!ctx) throw new Error('useTimelineDispatch must be used inside TimelineProvider')
  return ctx
}
