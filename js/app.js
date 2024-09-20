(() => {
    "use strict";
    const flsModules = {};
    function isWebp() {
        function testWebP(callback) {
            let webP = new Image;
            webP.onload = webP.onerror = function() {
                callback(webP.height == 2);
            };
            webP.src = "data:image/webp;base64,UklGRjoAAABXRUJQVlA4IC4AAACyAgCdASoCAAIALmk0mk0iIiIiIgBoSygABc6WWgAA/veff/0PP8bA//LwYAAA";
        }
        testWebP((function(support) {
            let className = support === true ? "webp" : "no-webp";
            document.documentElement.classList.add(className);
        }));
    }
    let bodyLockStatus = true;
    let bodyUnlock = (delay = 500) => {
        let wrapper = document.querySelector(".wrapper");
        if (bodyLockStatus) {
            let lock_padding = document.querySelectorAll("[data-lp]");
            setTimeout((() => {
                for (let index = 0; index < lock_padding.length; index++) {
                    const el = lock_padding[index];
                    el.style.paddingRight = "0px";
                }
                wrapper.style.paddingRight = "0px";
                document.documentElement.classList.remove("lock");
            }), delay);
            bodyLockStatus = false;
            setTimeout((function() {
                bodyLockStatus = true;
            }), delay);
        }
    };
    let bodyLock = (delay = 500) => {
        let wrapper = document.querySelector(".wrapper");
        if (bodyLockStatus) {
            let lock_padding = document.querySelectorAll("[data-lp]");
            for (let index = 0; index < lock_padding.length; index++) {
                const el = lock_padding[index];
                el.style.paddingRight = window.innerWidth - wrapper.offsetWidth + "px";
            }
            wrapper.style.paddingRight = window.innerWidth - wrapper.offsetWidth + "px";
            document.documentElement.classList.add("lock");
            bodyLockStatus = false;
            setTimeout((function() {
                bodyLockStatus = true;
            }), delay);
        }
    };
    function menuClose() {
        bodyUnlock();
        document.documentElement.classList.remove("menu-open");
    }
    function FLS(message) {
        setTimeout((() => {
            if (window.FLS) console.log(message);
        }), 0);
    }
    class Popup {
        constructor(options) {
            let config = {
                logging: true,
                init: true,
                attributeOpenButton: "data-popup",
                attributeCloseButton: "data-close",
                classes: {
                    popup: "popup",
                    popupContent: "popup__content",
                    popupActive: "popup_show",
                    bodyActive: "popup-show"
                },
                focusCatch: true,
                closeEsc: false,
                bodyLock: true,
                on: {
                    beforeOpen: function() {},
                    afterOpen: function() {},
                    beforeClose: function() {},
                    afterClose: function() {}
                }
            };
            this.isOpen = false;
            this.targetOpen = {
                selector: false,
                element: false
            };
            this.previousOpen = {
                selector: false,
                element: false
            };
            this.lastClosed = {
                selector: false,
                element: false
            };
            this._dataValue = false;
            this.hash = false;
            this._reopen = false;
            this._selectorOpen = false;
            this.lastFocusEl = false;
            this._focusEl = [ "a[href]", 'input:not([disabled]):not([type="hidden"]):not([aria-hidden])', "button:not([disabled]):not([aria-hidden])", "select:not([disabled]):not([aria-hidden])", "textarea:not([disabled]):not([aria-hidden])", "area[href]", "iframe", "object", "embed", "[contenteditable]", '[tabindex]:not([tabindex^="-"])' ];
            this.options = {
                ...config,
                ...options,
                classes: {
                    ...config.classes,
                    ...options?.classes
                },
                hashSettings: {
                    ...config.hashSettings,
                    ...options?.hashSettings
                },
                on: {
                    ...config.on,
                    ...options?.on
                }
            };
            this.bodyLock = false;
            this.options.init ? this.initPopups() : null;
        }
        initPopups() {
            this.eventsPopup();
        }
        eventsPopup() {
            document.addEventListener("click", function(e) {
                const buttonOpen = e.target.closest(`[${this.options.attributeOpenButton}]`);
                if (buttonOpen) {
                    e.preventDefault();
                    this._dataValue = buttonOpen.getAttribute(this.options.attributeOpenButton) ? buttonOpen.getAttribute(this.options.attributeOpenButton) : "error";
                    this.youTubeCode = buttonOpen.getAttribute(this.options.youtubeAttribute) ? buttonOpen.getAttribute(this.options.youtubeAttribute) : null;
                    if (this._dataValue !== "error") {
                        if (!this.isOpen) this.lastFocusEl = buttonOpen;
                        this.targetOpen.selector = `${this._dataValue}`;
                        this._selectorOpen = true;
                        this.open();
                        return;
                    }
                    return;
                }
                const buttonClose = e.target.closest(`[${this.options.attributeCloseButton}]`);
                if (buttonClose && this.isOpen) {
                    e.preventDefault();
                    this.close();
                    return;
                }
            }.bind(this));
        }
        open(selectorValue) {
            if (bodyLockStatus) {
                this.bodyLock = document.documentElement.classList.contains("lock") ? true : false;
                if (selectorValue && typeof selectorValue === "string" && selectorValue.trim() !== "") {
                    this.targetOpen.selector = selectorValue;
                    this._selectorOpen = true;
                }
                if (this.isOpen) {
                    this._reopen = true;
                    this.close();
                }
                if (!this._selectorOpen) this.targetOpen.selector = this.lastClosed.selector;
                if (!this._reopen) this.previousActiveElement = document.activeElement;
                this.targetOpen.element = document.querySelector(this.targetOpen.selector);
                if (this.targetOpen.element) {
                    this.options.on.beforeOpen(this);
                    document.dispatchEvent(new CustomEvent("beforePopupOpen", {
                        detail: {
                            popup: this
                        }
                    }));
                    this.targetOpen.element.classList.add(this.options.classes.popupActive);
                    document.documentElement.classList.add(this.options.classes.bodyActive);
                    if (!this._reopen) !this.bodyLock ? bodyLock() : null; else this._reopen = false;
                    this.targetOpen.element.setAttribute("aria-hidden", "false");
                    this.previousOpen.selector = this.targetOpen.selector;
                    this.previousOpen.element = this.targetOpen.element;
                    this._selectorOpen = false;
                    this.isOpen = true;
                    setTimeout((() => {
                        this._focusTrap();
                    }), 50);
                    this.options.on.afterOpen(this);
                    document.dispatchEvent(new CustomEvent("afterPopupOpen", {
                        detail: {
                            popup: this
                        }
                    }));
                }
            }
        }
        close(selectorValue) {
            if (selectorValue && typeof selectorValue === "string" && selectorValue.trim() !== "") this.previousOpen.selector = selectorValue;
            if (!this.isOpen || !bodyLockStatus) return;
            this.options.on.beforeClose(this);
            document.dispatchEvent(new CustomEvent("beforePopupClose", {
                detail: {
                    popup: this
                }
            }));
            this.previousOpen.element.classList.remove(this.options.classes.popupActive);
            this.previousOpen.element.classList.remove("_error");
            this.previousOpen.element.classList.remove("_success");
            this.previousOpen.element.setAttribute("aria-hidden", "true");
            if (!this._reopen) {
                document.documentElement.classList.remove(this.options.classes.bodyActive);
                !this.bodyLock ? bodyUnlock() : null;
                this.isOpen = false;
            }
            this._removeHash();
            if (this._selectorOpen) {
                this.lastClosed.selector = this.previousOpen.selector;
                this.lastClosed.element = this.previousOpen.element;
            }
            this.options.on.afterClose(this);
            document.dispatchEvent(new CustomEvent("afterPopupClose", {
                detail: {
                    popup: this
                }
            }));
            setTimeout((() => {
                this._focusTrap();
            }), 50);
        }
        _setHash() {
            history.pushState("", "", this.hash);
        }
        _removeHash() {
            history.pushState("", "", window.location.href.split("#")[0]);
        }
        _focusCatch(e) {
            const focusable = this.targetOpen.element.querySelectorAll(this._focusEl);
            const focusArray = Array.prototype.slice.call(focusable);
            const focusedIndex = focusArray.indexOf(document.activeElement);
            if (e.shiftKey && focusedIndex === 0) {
                focusArray[focusArray.length - 1].focus();
                e.preventDefault();
            }
            if (!e.shiftKey && focusedIndex === focusArray.length - 1) {
                focusArray[0].focus();
                e.preventDefault();
            }
        }
        _focusTrap() {
            const focusable = this.previousOpen.element.querySelectorAll(this._focusEl);
            if (!this.isOpen && this.lastFocusEl) this.lastFocusEl.focus(); else focusable[0].focus();
        }
    }
    flsModules.popup = new Popup({});
    let gotoblock_gotoBlock = (targetBlock, noHeader = false, speed = 500, offsetTop = 0) => {
        const targetBlockElement = document.querySelector(targetBlock);
        if (targetBlockElement) {
            let headerItem = "";
            let headerItemHeight = 0;
            if (noHeader) {
                headerItem = "header.header";
                headerItemHeight = document.querySelector(headerItem).offsetHeight;
            }
            let options = {
                speedAsDuration: true,
                speed,
                header: headerItem,
                offset: offsetTop,
                easing: "easeOutQuad"
            };
            document.documentElement.classList.contains("menu-open") ? menuClose() : null;
            if (typeof SmoothScroll !== "undefined") (new SmoothScroll).animateScroll(targetBlockElement, "", options); else {
                let targetBlockElementPosition = targetBlockElement.getBoundingClientRect().top + scrollY;
                targetBlockElementPosition = headerItemHeight ? targetBlockElementPosition - headerItemHeight : targetBlockElementPosition;
                targetBlockElementPosition = offsetTop ? targetBlockElementPosition - offsetTop : targetBlockElementPosition;
                window.scrollTo({
                    top: targetBlockElementPosition,
                    behavior: "smooth"
                });
            }
            FLS(`[gotoBlock]: Юхуу...едем к ${targetBlock}`);
        } else FLS(`[gotoBlock]: Ой ой..Такого блока нет на странице: ${targetBlock}`);
    };
    function formFieldsInit(options = {
        viewPass: false
    }) {
        const formFields = document.querySelectorAll("input[placeholder],textarea[placeholder]");
        if (formFields.length) formFields.forEach((formField => {
            if (!formField.hasAttribute("data-placeholder-nohide")) formField.dataset.placeholder = formField.placeholder;
        }));
        document.body.addEventListener("focusin", (function(e) {
            const targetElement = e.target;
            if (targetElement.tagName === "INPUT" || targetElement.tagName === "TEXTAREA") {
                if (targetElement.dataset.placeholder) targetElement.placeholder = "";
                if (!targetElement.hasAttribute("data-no-focus-classes")) {
                    targetElement.classList.add("_form-focus");
                    targetElement.parentElement.classList.add("_form-focus");
                }
                formValidate.removeError(targetElement);
            }
        }));
        document.body.addEventListener("focusout", (function(e) {
            const targetElement = e.target;
            if (targetElement.tagName === "INPUT" || targetElement.tagName === "TEXTAREA") {
                if (targetElement.dataset.placeholder) targetElement.placeholder = targetElement.dataset.placeholder;
                if (!targetElement.hasAttribute("data-no-focus-classes")) {
                    targetElement.classList.remove("_form-focus");
                    targetElement.parentElement.classList.remove("_form-focus");
                }
                if (targetElement.hasAttribute("data-validate")) formValidate.validateInput(targetElement);
            }
        }));
    }
    let formValidate = {
        getErrors(form) {
            let error = 0;
            let formRequiredItems = form.querySelectorAll("*[data-required]");
            if (formRequiredItems.length) formRequiredItems.forEach((formRequiredItem => {
                if ((formRequiredItem.offsetParent !== null || formRequiredItem.tagName === "SELECT") && !formRequiredItem.disabled) error += this.validateInput(formRequiredItem);
            }));
            return error;
        },
        validateInput(formRequiredItem) {
            let error = 0;
            if (formRequiredItem.dataset.required === "email") {
                formRequiredItem.value = formRequiredItem.value.replace(" ", "");
                if (this.emailTest(formRequiredItem)) {
                    this.addError(formRequiredItem);
                    error++;
                } else this.removeError(formRequiredItem);
            } else if (formRequiredItem.type === "checkbox" && !formRequiredItem.checked) {
                this.addError(formRequiredItem);
                error++;
            } else if (!formRequiredItem.value) {
                this.addError(formRequiredItem);
                error++;
            } else this.removeError(formRequiredItem);
            return error;
        },
        addError(formRequiredItem) {
            formRequiredItem.classList.add("_form-error");
            formRequiredItem.parentElement.classList.add("_form-error");
            let inputError = formRequiredItem.parentElement.querySelector(".form__error");
            if (inputError) formRequiredItem.parentElement.removeChild(inputError);
            if (formRequiredItem.dataset.error) formRequiredItem.parentElement.insertAdjacentHTML("beforeend", `<div class="form__error">${formRequiredItem.dataset.error}</div>`);
        },
        removeError(formRequiredItem) {
            formRequiredItem.classList.remove("_form-error");
            formRequiredItem.parentElement.classList.remove("_form-error");
            if (formRequiredItem.parentElement.querySelector(".form__error")) formRequiredItem.parentElement.removeChild(formRequiredItem.parentElement.querySelector(".form__error"));
        },
        formClean(form) {
            form.reset();
            setTimeout((() => {
                let inputs = form.querySelectorAll("input,textarea");
                for (let index = 0; index < inputs.length; index++) {
                    const el = inputs[index];
                    el.parentElement.classList.remove("_form-focus");
                    el.classList.remove("_form-focus");
                    formValidate.removeError(el);
                }
                let checkboxes = form.querySelectorAll(".checkbox__input");
                if (checkboxes.length > 0) for (let index = 0; index < checkboxes.length; index++) {
                    const checkbox = checkboxes[index];
                    checkbox.checked = false;
                }
                if (flsModules.select) {
                    let selects = form.querySelectorAll(".select");
                    if (selects.length) for (let index = 0; index < selects.length; index++) {
                        const select = selects[index].querySelector("select");
                        flsModules.select.selectBuild(select);
                    }
                }
            }), 0);
        },
        emailTest(formRequiredItem) {
            return !/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,8})+$/.test(formRequiredItem.value);
        }
    };
    function formSubmit(options = {
        validate: true
    }) {
        const forms = document.forms;
        if (forms.length) for (const form of forms) {
            form.addEventListener("submit", (function(e) {
                const form = e.target;
                formSubmitAction(form, e);
            }));
            form.addEventListener("reset", (function(e) {
                const form = e.target;
                formValidate.formClean(form);
            }));
        }
        async function formSubmitAction(form, e) {
            const error = !form.hasAttribute("data-no-validate") ? formValidate.getErrors(form) : 0;
            if (error === 0) {
                const ajax = form.hasAttribute("data-ajax");
                if (ajax) {
                    e.preventDefault();
                    const formAction = form.getAttribute("action") ? form.getAttribute("action").trim() : "#";
                    const formMethod = form.getAttribute("method") ? form.getAttribute("method").trim() : "GET";
                    const formData = new FormData(form);
                    const popupElement = document.getElementById("popup");
                    flsModules.popup.open("#popup");
                    popupElement.classList.add("_sending");
                    form.classList.add("_sending");
                    const response = await fetch(formAction, {
                        method: formMethod,
                        body: formData
                    });
                    if (response.ok) {
                        await response.json();
                        form.classList.remove("_sending");
                        popupElement.classList.remove("_sending");
                        popupElement.classList.add("_success");
                        formSent(form);
                    } else {
                        form.classList.remove("_sending");
                        popupElement.classList.remove("_sending");
                        popupElement.classList.add("_error");
                    }
                }
            } else {
                e.preventDefault();
                const formError = form.querySelector("._form-error");
                if (formError && form.hasAttribute("data-goto-error")) gotoblock_gotoBlock(formError, true, 1e3);
            }
        }
        function formSent(form) {
            document.dispatchEvent(new CustomEvent("formSent", {
                detail: {
                    form
                }
            }));
            setTimeout((() => {
                if (flsModules.popup) {
                    const popup = form.dataset.popupMessage;
                    popup ? flsModules.popup.open(popup) : null;
                }
            }), 0);
            formValidate.formClean(form);
        }
    }
    window.addEventListener("load", (function(e) {
        initSliders();
    }));
    function initSliders() {
        if (document.querySelector(".testimon__slider")) {
            new Swiper(".testimon__slider", {
                observer: true,
                observeParents: true,
                speed: 1500,
                allowTouchMove: true,
                keyboard: true,
                pagination: false,
                loop: true,
                autoplay: {
                    delay: 6e3,
                    disableOnInteraction: false
                },
                navigation: {
                    prevEl: ".swiper-button-prev",
                    nextEl: ".swiper-button-next"
                },
                breakpoints: {
                    320: {
                        slidesPerView: 1,
                        spaceBetween: 16
                    },
                    768: {
                        slidesPerView: 2,
                        spaceBetween: 16
                    },
                    992: {
                        slidesPerView: 2,
                        spaceBetween: 24
                    }
                }
            });
        }
    }
    let addWindowScrollEvent = false;
    setTimeout((() => {
        if (addWindowScrollEvent) {
            let windowScroll = new Event("windowScroll");
            window.addEventListener("scroll", (function(e) {
                document.dispatchEvent(windowScroll);
            }));
        }
    }), 0);
    document.addEventListener("DOMContentLoaded", (function(event) {
        const header = document.querySelector(".header");
        if (header) {
            let headerHeight = header.offsetHeight;
            const scrollWatcher = document.createElement("div");
            scrollWatcher.setAttribute("data-scroll-watcher", "");
            header.before(scrollWatcher);
            const navObserver = new IntersectionObserver((entries => {
                header.classList.toggle("_shadowed", !entries[0].isIntersecting);
            }));
            navObserver.observe(scrollWatcher);
            let lastScrollPos = 0;
            window.onscroll = function() {
                let currentScrollPos = window.pageYOffset;
                let freeRunLength = headerHeight * 2;
                if (Math.abs(currentScrollPos - lastScrollPos) < freeRunLength) return;
                if (lastScrollPos > currentScrollPos) header.style.top = "0"; else header.style.top = "-" + headerHeight + "px";
                lastScrollPos = currentScrollPos;
            };
            const ankhorLinks = document.querySelectorAll('a[href^="#"]');
            ankhorLinks.forEach((link => {
                link.onclick = function(event) {
                    event.preventDefault();
                    const targetId = this.getAttribute("href").slice(1);
                    const targetSection = document.getElementById(targetId);
                    const targetOffset = targetSection.offsetTop;
                    const currentScrollPos = window.pageYOffset;
                    const scrollMarginTop = parseInt(window.getComputedStyle(targetSection).getPropertyValue("scroll-margin-top"), 10);
                    let scrollCorrection = 0;
                    if (targetOffset > currentScrollPos + headerHeight * 2) scrollCorrection = scrollMarginTop; else scrollCorrection = scrollMarginTop + headerHeight;
                    window.scrollTo({
                        top: targetOffset - scrollCorrection,
                        behavior: "smooth"
                    });
                };
            }));
            window.addEventListener("resize", (() => {
                headerHeight = header.offsetHeight;
            }));
        }
        const charCounter = document.querySelector("#char-counter");
        const inputMessage = document.querySelector("#message");
        if (charCounter && inputMessage) {
            const maxChars = inputMessage.getAttribute("maxlength");
            inputMessage.addEventListener("input", (function() {
                let charAmount = inputMessage.value.length;
                charCounter.textContent = `${charAmount}/${maxChars}`;
            }));
        }
    }));
    window.addEventListener("load", (() => {
        const shader = document.querySelector("._shader");
        shader.classList.add("loaded");
        setTimeout((() => {
            shader.style.display = "none";
        }), 700);
        const hiddenWorks = document.querySelector("._hidden-works");
        if (hiddenWorks) {
            const moreWorksBtnHtml = '<button type="button" id="more-works" class="portfolio__more-btn btn btn_main">Show More</button>';
            hiddenWorks.insertAdjacentHTML("afterend", moreWorksBtnHtml);
            const moreWorksBtn = document.getElementById("more-works");
            let originalHeight;
            originalHeightHiddenWorks();
            moreWorksBtn.onclick = function() {
                hiddenWorks.classList.toggle("shown");
                if (moreWorksBtn.textContent === "Show More") {
                    moreWorksBtn.textContent = "Show Less";
                    hiddenWorks.style.maxHeight = originalHeight + "px";
                } else {
                    moreWorksBtn.textContent = "Show More";
                    hiddenWorks.style.maxHeight = "0px";
                }
            };
            window.addEventListener("resize", (event => {
                originalHeightHiddenWorks();
                if (hiddenWorks.classList.contains("shown")) hiddenWorks.style.maxHeight = originalHeight + "px";
            }));
            function originalHeightHiddenWorks() {
                originalHeight = hiddenWorks.scrollHeight;
            }
        }
    }));
    window.addEventListener("load", (() => {
        const mediaHero = document.querySelector(".media-hero");
        if (mediaHero) {
            const man = mediaHero.querySelector(".media-hero__man");
            const mouse = mediaHero.querySelector(".media-hero__mouse");
            const like = mediaHero.querySelector(".media-hero__like");
            const webcam = mediaHero.querySelector(".media-hero__webcam");
            const keyboard = mediaHero.querySelector(".media-hero__keyboard");
            const joistick = mediaHero.querySelector(".media-hero__joistick");
            let isMauseWathing = false;
            let heroIsIntersecting = false;
            let manX = 0, manY = 0;
            const childElements = [ mouse, like, webcam, keyboard, joistick ];
            const distances = Array(childElements.length).fill(0);
            const angles = Array(childElements.length).fill(0);
            const movementKoef = .1;
            checkParallax();
            const heroObserver = new IntersectionObserver((entries => {
                if (!entries[0].isIntersecting) {
                    heroIsIntersecting = false;
                    if (isMauseWathing) window.removeEventListener("mousemove", mouseWatcher);
                    return;
                } else {
                    heroIsIntersecting = true;
                    if (mediaHero.classList.contains("_parallax")) {
                        getCoordinates();
                        getDistance();
                        getAngles();
                        window.addEventListener("mousemove", mouseWatcher);
                        isMauseWathing = true;
                    }
                    if (mediaHero.classList.contains("_rotation")) {
                        getCoordinates();
                        getDistance();
                        setOriginPoints();
                    }
                }
            }));
            heroObserver.observe(mediaHero);
            window.addEventListener("resize", (() => {
                checkParallax();
                getCoordinates();
                getDistance();
                if (mediaHero.classList.contains("_rotation")) setOriginPoints();
            }));
            let mouseX = window.innerWidth / 2;
            let mouseY = window.innerHeight / 2;
            function checkParallax() {
                if (window.innerWidth >= 860 && !mediaHero.classList.contains("_parallax")) {
                    mediaHero.classList.add("_parallax");
                    mediaHero.classList.remove("_rotation");
                    if (heroIsIntersecting) {
                        getCoordinates();
                        getAngles();
                        window.addEventListener("mousemove", mouseWatcher);
                        isMauseWathing = true;
                    }
                }
                if (window.innerWidth < 860 && !mediaHero.classList.contains("_rotation")) {
                    mediaHero.classList.add("_rotation");
                    mediaHero.classList.remove("_parallax");
                    if (isMauseWathing) window.removeEventListener("mousemove", mouseWatcher);
                }
            }
            function getCoordinates() {
                manX = man.getBoundingClientRect().left + man.getBoundingClientRect().width / 2;
                manY = man.getBoundingClientRect().top + man.getBoundingClientRect().height / 2;
            }
            function getDistance() {
                resetTransform();
                childElements.forEach(((element, index) => {
                    const childX = element.getBoundingClientRect().left + element.getBoundingClientRect().width / 2;
                    const childY = element.getBoundingClientRect().top + element.getBoundingClientRect().height / 2;
                    distances[index] = Math.sqrt((manX - childX) ** 2 + (manY - childY) ** 2);
                }));
            }
            function getAngles() {
                childElements.forEach(((element, index) => {
                    const childX = element.getBoundingClientRect().left + element.getBoundingClientRect().width / 2;
                    const childY = element.getBoundingClientRect().top + element.getBoundingClientRect().height / 2;
                    angles[index] = Math.atan2(manY - childY, manX - childX);
                }));
            }
            function resetTransform() {
                childElements.forEach(((element, index) => {
                    element.style.cssText = `transform: translate(0px,0px) scale(1);`;
                    element.style.transformOrigin = "initial";
                }));
            }
            function setOriginPoints() {
                childElements.forEach(((element, index) => {
                    let deltaX = manX - element.getBoundingClientRect().left;
                    let deltaY = manY - element.getBoundingClientRect().top;
                    element.style.transformOrigin = `${deltaX}px ${deltaY}px`;
                }));
            }
            function setMouseParallaxStyle() {
                let mouseAngle = Math.atan2(mouseY - window.innerHeight / 2, mouseX - window.innerWidth / 2);
                let mouseDist = Math.sqrt((window.innerWidth / 2 - mouseX) ** 2 + (window.innerHeight / 2 - mouseY) ** 2);
                childElements.forEach(((element, index) => {
                    const childDist = distances[index];
                    const childAngle = angles[index];
                    let posX = Math.cos(childAngle) * mouseDist * movementKoef * childDist / (window.innerWidth / 2) * Math.abs(Math.cos(mouseAngle));
                    let posY = Math.sin(childAngle) * mouseDist * movementKoef * childDist / (window.innerWidth / 2) * Math.abs(Math.sin(mouseAngle));
                    let scale = 1 + Math.cos(childAngle) * Math.cos(mouseAngle) * mouseDist / (5 * window.innerWidth) + Math.sin(childAngle) * Math.sin(mouseAngle) * mouseDist / (5 * window.innerHeight);
                    scale = Math.max(.9, Math.min(scale, 1.1));
                    element.style.cssText = `transform: translate(${posX}px,${posY}px) scale(${scale});`;
                }));
            }
            function mouseWatcher(e) {
                mouseX = e.clientX;
                mouseY = e.clientY;
                if (mediaHero.classList.contains("_parallax")) setMouseParallaxStyle();
            }
        }
    }));
    let options = {
        stringsElement: "#typed-strings",
        typeSpeed: 60,
        startDelay: 50,
        backDelay: 2e3,
        loop: true,
        backSpeed: 30,
        smartBackspace: true
    };
    if (document.querySelector(".typing-text__text")) {
        new Typed(".typing-text__text", options);
    }
    const footerIcons = document.querySelector("._anim__parent");
    if (footerIcons) {
        const animFooterIcons = new IntersectionObserver((entries => {
            if (!entries[0].isIntersecting) return;
            entries[0].target.classList.add("_animated");
            animFooterIcons.unobserve(entries[0].target);
        }));
        animFooterIcons.observe(footerIcons);
    }
    window["FLS"] = true;
    isWebp();
    formFieldsInit({
        viewPass: false,
        autoHeight: false
    });
    formSubmit();




// app.js or within a <script> tag in your HTML

// app.js or within a <script> tag in your HTML

document.addEventListener("DOMContentLoaded", function() {
    const works = document.querySelectorAll('.work');
  
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target); // Stop observing the element once it's visible
        }
      });
    }, { threshold: 0.1 });
  
    works.forEach(work => {
      observer.observe(work);
    });
  });
  
  
})();

