<script lang="ts">
  import { sendRegister, loadCaptcha, captchaAnswer, captchaToken, captchaSvg } from "./script";
  import "./style.scss";

  let firstName = "";
  let lastName = "";
  let email = "";
  let password = "";
  let message = "";
  let messageColor = "";
  let borderMSG = "";
  let captcha = false;
  let captchaLoaded = false;
  let captchaOk = false;

  async function handleSubmit() {
    if (!captchaOk) {
      captcha = true;
      if (!captchaLoaded) {
        await loadCaptcha();
        captchaLoaded = true;
      }
      message = "Confirme que você é humano.";
      borderMSG = "orange";
      messageColor = "#fff2cc";
      return;
    }
    await doRegister();
  }

  async function doRegister() {
    const result = await sendRegister(firstName, lastName, email, password, $captchaAnswer, $captchaToken);

    if (result.error) {
      const msg = result.data?.message || result.message || "Erro no register";
      message = msg;
      borderMSG = "white";
      messageColor = "#fc5558";

      if (/captcha/i.test(msg) && /(inválido|expirado|invalid|expired)/i.test(msg)) {
        captchaOk = false;
        captcha = true;
        await loadCaptcha();
      } else {
        captcha = false;
      }
    } else {
      message = "register successful";
      borderMSG = "1px solid green";
      messageColor = "#5efc55";
    }
  }

  async function confirmCaptcha() {
    if (!$captchaAnswer.trim()) return;
    captcha = false;
    captchaOk = true;
    await doRegister();
  }

  function refreshCaptcha() {
    loadCaptcha();
  }

  function closeModal() {
    captcha = false;
  }
</script>

<main>
  <div class="form-card">
    <h1>register Simple-ecommerce</h1>

    <form on:submit|preventDefault={handleSubmit}>
      <span>First name</span>
      <input class="register-input-name" type="text" bind:value={firstName} placeholder="John" />

      <span>Last name</span>
      <input class="register-input-name" type="text" bind:value={lastName} placeholder="Doe" />

      <span>Email</span>
      <input class="register-input-email" type="email" bind:value={email} placeholder="example@example.com" />

      <span>Password</span>
      <input class="register-input-password" type="password" bind:value={password} placeholder="*********" />

      <button class="register-button" type="submit">Register</button>

      {#if message}
        <div style="border: 1px solid {borderMSG}; background-color: {messageColor}; text-align: center; border-radius: 12px;">
          <p style="color:{borderMSG}">{message}</p>
        </div>
      {/if}

      <div>
        <p>Already have an account? <a href="/login">login</a></p>
      </div>
    </form>
  </div>

{#if captcha}
  <div class="shadow"></div>
  <button type="button" class="shadow-btn" aria-label="Fechar captcha" on:click={closeModal}></button>
  <div class="captcha" role="dialog" aria-modal="true" aria-label="Verificação humana">
    <button class="close" type="button" on:click={closeModal} aria-label="Fechar">×</button>
    <span>Prove que você é humano</span>
    <button type="button" class="captcha-svg-btn" title="Clique para recarregar" aria-label="Recarregar captcha" on:click={refreshCaptcha}>{@html $captchaSvg}</button>
    <input type="text" bind:value={$captchaAnswer} placeholder="Resultado do captcha" />
    <div class="captcha-actions">
      <button type="button" on:click={refreshCaptcha}>Recarregar</button>
      <button type="button" on:click={confirmCaptcha} disabled={!$captchaAnswer.trim()}>
        Confirmar Captcha
      </button>
    </div>
  </div>
{/if}

</main>
