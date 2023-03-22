import type { Component } from 'solid-js';
import { createSignal, Show } from 'solid-js';

interface Props {}

const App: Component<Props> = (_props) => {

  const [ is_visible, set_is_visible ] = createSignal(true);

  return <div>
    <label>
      Is Visible? <input type="checkbox" checked={is_visible()} onChange={() => set_is_visible(!is_visible()) } />
    </label>
    <Show when={is_visible()}>
    <pre>{String.raw`
 _____________
< Hello World >
 -------------
       \   ,__,
        \  (^^)____
           (__)    )\
              ||--|| *`}</pre>
    </Show>
  </div>;
};

export default App;
