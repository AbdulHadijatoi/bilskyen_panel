<template>
  <div class="flex w-full flex-col gap-2">
    <div class="flex justify-between gap-3 max-sm:flex-col sm:items-center">
      <div>
        <h2 class="text-xl font-bold">General Ledger Entries</h2>
        <p class="text-muted-foreground max-w-3xl">
          View and manage all accounting transactions and general ledger entries.
        </p>
      </div>
      <v-btn color="primary" :to="{ name: 'dealer.accounting.add-transaction' }" prepend-icon="mdi-plus">
        Add Transaction
      </v-btn>
    </div>
    <v-divider class="my-3" />
    <v-card>
      <v-card-text>
        <p class="text-center text-muted-foreground py-8">Transactions data table will be implemented here</p>
      </v-card-text>
    </v-card>
  </div>
</template>

