const ADMIN_LOGIN_ALIASES: Readonly<Record<string, string>> = {
  admin: "admin@tamadee.online",
  sysadmin: "sysadmin@tamadee.online",
};

const LOGIN_PLACEHOLDER = "admin, sysadmin หรืออีเมลผู้ดูแล";
let installed = false;

export function resolveAdminLoginInput(rawValue: string): string {
  const trimmed = rawValue.trim();
  const mapped = ADMIN_LOGIN_ALIASES[trimmed.toLowerCase()];
  return mapped ?? trimmed;
}

function setReactControlledValue(input: HTMLInputElement, nextValue: string): void {
  const descriptor = Object.getOwnPropertyDescriptor(
    HTMLInputElement.prototype,
    "value"
  );
  descriptor?.set?.call(input, nextValue);
  input.dispatchEvent(new Event("input", { bubbles: true }));
  input.dispatchEvent(new Event("change", { bubbles: true }));
}

function isLoginEmailInput(element: EventTarget | null): element is HTMLInputElement {
  if (!(element instanceof HTMLInputElement)) {
    return false;
  }
  if (element.name !== "email") {
    return false;
  }
  return window.location.pathname.includes("/login");
}

function normalizeEmailInputElement(input: HTMLInputElement): void {
  const resolved = resolveAdminLoginInput(input.value);
  if (resolved !== input.value) {
    setReactControlledValue(input, resolved);
  }
}

function relaxLoginInputType(): void {
  if (!window.location.pathname.includes("/login")) {
    return;
  }
  const input = document.querySelector<HTMLInputElement>('input[name="email"]');
  if (!input) {
    return;
  }
  if (input.type === "email") {
    input.type = "text";
    input.setAttribute("inputmode", "email");
    input.setAttribute("autocomplete", "username");
  }
  if (input.placeholder !== LOGIN_PLACEHOLDER) {
    input.placeholder = LOGIN_PLACEHOLDER;
  }
}

/**
 * Allows operators to type short usernames (`admin`, `sysadmin`) directly into
 * `@mercurjs/admin`'s login form by expanding them to `@tamadee.online` before
 * React Hook Form + Zod `.email()` validation runs.
 */
export function installAdminUsernameLogin(): void {
  if (installed || typeof window === "undefined" || typeof document === "undefined") {
    return;
  }
  installed = true;

  document.addEventListener(
    "blur",
    (event) => {
      if (isLoginEmailInput(event.target)) {
        normalizeEmailInputElement(event.target);
      }
    },
    true
  );

  document.addEventListener(
    "submit",
    (event) => {
      if (!(event.target instanceof HTMLFormElement)) {
        return;
      }
      const input = event.target.querySelector<HTMLInputElement>('input[name="email"]');
      if (input && window.location.pathname.includes("/login")) {
        normalizeEmailInputElement(input);
      }
    },
    true
  );

  const observer = new MutationObserver(() => relaxLoginInputType());
  observer.observe(document.documentElement, { childList: true, subtree: true });
  relaxLoginInputType();
}
