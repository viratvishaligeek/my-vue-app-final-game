<template>
<div class="row g-2 mb-4 ms-2 me-2">
      <div class="col-4">
        <router-link to="/wallet/add" class="btn bg-success w-100 text-light">
          <span class="icon-3d">💰</span>
          <span>Add Money</span>
        </router-link>
      </div>
      <div class="col-4">
        <router-link to="/wallet/withdraw" class="btn bg-danger w-100 text-light">
          <span class="icon-3d">💸</span>
          Withdraw
        </router-link>
      </div>
      <div class="col-4">
        <router-link to="/live-support" class="btn bg-primary w-100 text-light">
          <span class="icon-3d">💬</span>
          Support
        </router-link>
      </div>
    </div>
</template>
