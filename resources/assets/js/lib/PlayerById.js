import get from "lodash/get";

// Returns either an object a boolean or false
export default function PlayerById(id) {
  if (!window.RS.enemies) return;

  for (let i = 0; i < window.RS.enemies.children.length; i++) {
    if (get(window.RS, `enemies.children[${i}].data.id`) === id) {
      return window.RS.enemies.children[i];
    }
  }
}
