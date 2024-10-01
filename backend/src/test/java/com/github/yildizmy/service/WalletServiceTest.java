package com.github.yildizmy.service;

import com.github.yildizmy.dto.mapper.WalletResponseMapper;
import com.github.yildizmy.dto.response.WalletResponse;
import com.github.yildizmy.exception.NoSuchElementFoundException;
import com.github.yildizmy.model.Wallet;
import com.github.yildizmy.repository.WalletRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;

import java.math.BigDecimal;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class WalletServiceTest {

    @Mock
    private WalletRepository walletRepository;

    @Mock
    private WalletResponseMapper walletResponseMapper;

    @InjectMocks
    private WalletService walletService;

    @Test
    void findById_shouldReturnWalletResponse() {
        Wallet wallet = createTestWallet(1L, "TEST123", "Test Wallet", BigDecimal.valueOf(1000));
        WalletResponse expectedResponse = createTestWalletResponse(1L, "TEST123", "Test Wallet", BigDecimal.valueOf(1000));

        when(walletRepository.findById(1L)).thenReturn(Optional.of(wallet));
        when(walletResponseMapper.toDto(wallet)).thenReturn(expectedResponse);

        WalletResponse result = walletService.findById(1L);

        assertNotNull(result);
        assertEquals(expectedResponse, result);
        verify(walletRepository).findById(1L);
        verify(walletResponseMapper).toDto(wallet);
    }

    @Test
    void findById_shouldThrowExceptionWhenWalletNotFound() {
        when(walletRepository.findById(1L)).thenReturn(Optional.empty());

        assertThrows(NoSuchElementFoundException.class, () -> walletService.findById(1L));
        verify(walletRepository).findById(1L);
    }

    @Test
    void findByIban_shouldReturnWalletResponse() {
        Wallet wallet = createTestWallet(1L, "TEST123", "Test Wallet", BigDecimal.valueOf(1000));
        WalletResponse expectedResponse = createTestWalletResponse(1L, "TEST123", "Test Wallet", BigDecimal.valueOf(1000));

        when(walletRepository.findByIban("TEST123")).thenReturn(Optional.of(wallet));
        when(walletResponseMapper.toDto(wallet)).thenReturn(expectedResponse);

        WalletResponse result = walletService.findByIban("TEST123");

        assertNotNull(result);
        assertEquals(expectedResponse, result);
        verify(walletRepository).findByIban("TEST123");
        verify(walletResponseMapper).toDto(wallet);
    }

    @Test
    void findByUserId_shouldReturnListOfWalletResponses() {
        List<Wallet> wallets = Arrays.asList(
                createTestWallet(1L, "TEST123", "Test Wallet 1", BigDecimal.valueOf(1000)),
                createTestWallet(2L, "TEST456", "Test Wallet 2", BigDecimal.valueOf(2000))
        );
        List<WalletResponse> expectedResponses = Arrays.asList(
                createTestWalletResponse(1L, "TEST123", "Test Wallet 1", BigDecimal.valueOf(1000)),
                createTestWalletResponse(2L, "TEST456", "Test Wallet 2", BigDecimal.valueOf(2000))
        );

        when(walletRepository.findByUserId(1L)).thenReturn(wallets);
        when(walletResponseMapper.toDto(any(Wallet.class))).thenReturn(expectedResponses.get(0), expectedResponses.get(1));

        List<WalletResponse> result = walletService.findByUserId(1L);

        assertNotNull(result);
        assertEquals(2, result.size());
        assertEquals(expectedResponses, result);
        verify(walletRepository).findByUserId(1L);
        verify(walletResponseMapper, times(2)).toDto(any(Wallet.class));
    }

    @Test
    void getByIban_shouldReturnWallet() {
        Wallet expectedWallet = createTestWallet(1L, "TEST123", "Test Wallet", BigDecimal.valueOf(1000));

        when(walletRepository.findByIban("TEST123")).thenReturn(Optional.of(expectedWallet));

        Wallet result = walletService.getByIban("TEST123");

        assertNotNull(result);
        assertEquals(expectedWallet, result);
        verify(walletRepository).findByIban("TEST123");
    }

    @Test
    void getByIban_shouldThrowExceptionWhenWalletNotFound() {
        when(walletRepository.findByIban("TEST123")).thenReturn(Optional.empty());

        assertThrows(NoSuchElementFoundException.class, () -> walletService.getByIban("TEST123"));
        verify(walletRepository).findByIban("TEST123");
    }

    @Test
    void findAll_shouldReturnPageOfWalletResponses() {
        Page<Wallet> walletPage = new PageImpl<>(Collections.singletonList(
                createTestWallet(1L, "TEST123", "Test Wallet", BigDecimal.valueOf(1000))
        ));
        Pageable pageable = Pageable.unpaged();
        WalletResponse expectedResponse = createTestWalletResponse(1L, "TEST123", "Test Wallet", BigDecimal.valueOf(1000));

        when(walletRepository.findAll(pageable)).thenReturn(walletPage);
        when(walletResponseMapper.toDto(any(Wallet.class))).thenReturn(expectedResponse);

        Page<WalletResponse> result = walletService.findAll(pageable);

        assertNotNull(result);
        assertEquals(1, result.getContent().size());
        assertEquals(expectedResponse, result.getContent().get(0));
        verify(walletRepository).findAll(pageable);
        verify(walletResponseMapper).toDto(any(Wallet.class));
    }

    @Test
    void findAll_shouldThrowExceptionWhenNoWalletsFound() {
        Pageable pageable = Pageable.unpaged();
        when(walletRepository.findAll(pageable)).thenReturn(Page.empty());

        assertThrows(NoSuchElementFoundException.class, () -> walletService.findAll(pageable));
        verify(walletRepository).findAll(pageable);
    }

    private Wallet createTestWallet(Long id, String iban, String name, BigDecimal balance) {
        Wallet wallet = new Wallet();
        wallet.setId(id);
        wallet.setIban(iban);
        wallet.setName(name);
        wallet.setBalance(balance);
        return wallet;
    }

    private WalletResponse createTestWalletResponse(Long id, String iban, String name, BigDecimal balance) {
        WalletResponse response = new WalletResponse();
        response.setId(id);
        response.setIban(iban);
        response.setName(name);
        response.setBalance(balance);
        return response;
    }
}
