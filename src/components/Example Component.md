Starter Template

```.astro

---
import AnotherComponent from '../components/AnotherComponent.astro';
import Navigation from '../layouts/Navigation.astro';
import Footer from './Footer.astro';
import '../styles/component.scss';

const { title } = Astro.props;

const isProduction = import.meta.env.PROD;
---

<fade-in>
	<Navigation>
		<li><a href="#foo">Foo</a></li>
		<li><a href="#bar">Bar</a></li>
		<li><a href="#baz">Baz</a></li>
	</Navigation>
	<main id="main-content">
		<h1 class="sr-only">{title}</h1>
		<slot />
	</main>
	<Footer>
		<slot name="footer-copy" />
	</Footer>
	{isProduction && <AnotherComponent isEnabled={true} />}
</fade-in>


<!-- <script>
  import gsap from "gsap";
  import { ScrollTrigger } from "gsap/ScrollTrigger";

  gsap.registerPlugin(ScrollTrigger);

  class FadeIn extends HTMLElement {
    $element: any;

    connectedCallback() {
      this.init();
    }

    init() {
			this.$element = this;

      this.layout().enable();

      return this;
    }

    layout() {
			console.log(this.$element);
			

      return this;
    }

    enable() {

      return this;
    }
  }

  customElements.define('fade-in', FadeIn);
</script> -->
```